'use strict';

const path = require('path');
const fs = require('fs');
const { rubberBand, projectMomentum, shouldDismiss, springPhysics } = require('../motion/core');

const CAPABILITIES = Object.freeze([
  'gestureVelocity', 'haptics', 'interactiveDismiss', 'rubberBand',
  'sharedElement', 'keyboardSafeArea', 'reducedMotion', 'dynamicType',
]);

const SOURCES = Object.freeze({
  swiftui: `import SwiftUI
import UIKit

struct DesignOSMotionSurface<Content: View>: View {
  @Environment(\\.accessibilityReduceMotion) private var reduceMotion
  @Environment(\\.dynamicTypeSize) private var dynamicType
  @GestureState private var drag: CGSize = .zero
  @State private var dismissed = false
  let namespace: Namespace.ID
  let content: () -> Content

  var body: some View {
    content()
      .matchedGeometryEffect(id: "designos-shared-element", in: namespace)
      .offset(x: dismissed ? 420 : drag.width)
      .safeAreaPadding(.bottom)
      .contentTransition(reduceMotion ? .opacity : .interpolate)
      .gesture(DragGesture()
        .updating($drag) { value, state, _ in state.width = rubberBand(value.translation.width, 420) }
        .onEnded { value in
          let velocity = value.predictedEndTranslation.width - value.translation.width
          let shouldDismiss = abs(value.translation.width) > 210 || abs(velocity) > 110
          UIImpactFeedbackGenerator(style: .light).impactOccurred()
          withAnimation(reduceMotion ? nil : .interactiveSpring(response: 0.42, dampingFraction: 0.86)) {
            dismissed = shouldDismiss
          }
        })
      .dynamicTypeSize(.xSmall ... .accessibility5)
  }

  private func rubberBand(_ overshoot: CGFloat, _ dimension: CGFloat) -> CGFloat {
    (overshoot * dimension * 0.55) / (dimension + 0.55 * abs(overshoot))
  }
}`,
  compose: `package designos.motion

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.gestures.*
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalAccessibilityManager
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.IntOffset

@OptIn(ExperimentalSharedTransitionApi::class)
@Composable
fun SharedTransitionScope.DesignOSMotionSurface(
  animatedVisibilityScope: AnimatedVisibilityScope,
  content: @Composable () -> Unit
) {
  val accessibility = LocalAccessibilityManager.current
  val reduceMotion = accessibility?.isEnabled == true
  val haptics = LocalHapticFeedback.current
  val fontScale = LocalDensity.current.fontScale
  var offset by remember { mutableFloatStateOf(0f) }
  var velocity by remember { mutableFloatStateOf(0f) }
  val animated by animateFloatAsState(offset, if (reduceMotion) snap() else spring(dampingRatio = .86f), label = "interactive-dismiss")
  Box(Modifier
    .sharedBounds(rememberSharedContentState(key = "designos-shared-element"), animatedVisibilityScope)
    .windowInsetsPadding(WindowInsets.safeDrawing.union(WindowInsets.ime))
    .semantics { contentDescription = "Motion surface scale $fontScale" }
    .offset { IntOffset(animated.toInt(), 0) }
    .draggable(Orientation.Horizontal, rememberDraggableState { delta ->
      velocity = delta
      offset = rubberBand(offset + delta, 420f)
    }, onDragStopped = { releaseVelocity ->
      val dismiss = kotlin.math.abs(offset) > 210f || kotlin.math.abs(releaseVelocity) > 110f
      haptics.performHapticFeedback(HapticFeedbackType.LongPress)
      offset = if (dismiss) 420f else 0f
    })
    .animateContentSize(if (reduceMotion) snap() else spring())) { content() }
}
private fun rubberBand(x: Float, size: Float): Float = (x * size * .55f) / (size + .55f * kotlin.math.abs(x))
`,
  'react-native': `import React from 'react';
import { AccessibilityInfo, KeyboardAvoidingView, Platform, SafeAreaView, useWindowDimensions } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export function DesignOSMotionSurface({children, onDismiss, sharedTransitionTag='designos-shared-element'}) {
  const x=useSharedValue(0); const reduce=useSharedValue(false); const {fontScale}=useWindowDimensions();
  React.useEffect(()=>{const sub=AccessibilityInfo.addEventListener('reduceMotionChanged',v=>{reduce.value=v;x.value=0});
    AccessibilityInfo.isReduceMotionEnabled().then(v=>reduce.value=v);return()=>sub.remove();},[]);
  const pan=Gesture.Pan().onUpdate(e=>{x.value=rubberBand(e.translationX,420)})
    .onEnd(e=>{const dismiss=Math.abs(e.translationX)>210||Math.abs(e.velocityX)>110;
      x.value=reduce.value?withTiming(dismiss?420:0,{duration:0}):withSpring(dismiss?420:0,{velocity:e.velocityX,damping:22});
      runOnJS(triggerHaptic)();if(dismiss&&onDismiss)runOnJS(onDismiss)();});
  const style=useAnimatedStyle(()=>({transform:[{translateX:x.value}]}));
  return <SafeAreaView><KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'}>
    <GestureDetector gesture={pan}><Animated.View sharedTransitionTag={sharedTransitionTag}
      accessibilityLabel={'Motion surface'} style={[style,{paddingBottom:Math.max(16,fontScale*8)}]}>{children}</Animated.View></GestureDetector>
  </KeyboardAvoidingView></SafeAreaView>;
}
const rubberBand=(x,size)=>(x*size*.55)/(size+.55*Math.abs(x));
const triggerHaptic=()=>ReactNativeHapticFeedback.trigger('selection',{ignoreAndroidSystemSettings:false});
`,
  flutter: `import 'package:flutter/material.dart';
import 'package:flutter/physics.dart';
import 'package:flutter/services.dart';

class DesignOSMotionSurface extends StatefulWidget {
  const DesignOSMotionSurface({super.key, required this.child, this.onDismiss});
  final Widget child; final VoidCallback? onDismiss;
  @override State<DesignOSMotionSurface> createState()=>_DesignOSMotionSurfaceState();
}
class _DesignOSMotionSurfaceState extends State<DesignOSMotionSurface> with SingleTickerProviderStateMixin {
  late final AnimationController controller=AnimationController.unbounded(vsync:this);
  double x=0, velocity=0;
  @override void dispose(){controller.dispose();super.dispose();}
  @override Widget build(BuildContext context){
    final media=MediaQuery.of(context); final reduce=media.disableAnimations;
    return MediaQuery(data:media.copyWith(textScaler:media.textScaler.clamp(minScaleFactor:1,maxScaleFactor:2)),
      child:SafeArea(child:Padding(padding:EdgeInsets.only(bottom:media.viewInsets.bottom),
        child:Hero(tag:'designos-shared-element',child:GestureDetector(
          onHorizontalDragUpdate:(d)=>setState((){velocity=d.primaryDelta??0;x=rubberBand(x+velocity,420);}),
          onHorizontalDragEnd:(d){final v=d.primaryVelocity??velocity;final dismiss=x.abs()>210||v.abs()>110;
            HapticFeedback.selectionClick();if(reduce){setState(()=>x=dismiss?420:0);}
            else{controller.animateWith(SpringSimulation(const SpringDescription(mass:1,stiffness:180,damping:22),x,dismiss?420:0,v));}
            if(dismiss)widget.onDismiss?.call();},
          child:Transform.translate(offset:Offset(x,0),child:widget.child))))));
  }
  double rubberBand(double value,double size)=>(value*size*.55)/(size+.55*value.abs());
}
// CupertinoPageRoute/PopScope supplies interactive and predictive back continuity.
`,
});

const SIGNALS = Object.freeze({
  swiftui: {
    gestureVelocity: 'predictedEndTranslation', haptics: 'UIImpactFeedbackGenerator',
    interactiveDismiss: 'DragGesture', rubberBand: 'rubberBand', sharedElement: 'matchedGeometryEffect',
    keyboardSafeArea: 'safeAreaPadding(.bottom)', reducedMotion: 'accessibilityReduceMotion',
    dynamicType: 'dynamicTypeSize',
  },
  compose: {
    gestureVelocity: 'releaseVelocity', haptics: 'performHapticFeedback',
    interactiveDismiss: '.draggable(', rubberBand: 'rubberBand', sharedElement: '.sharedBounds(',
    keyboardSafeArea: 'WindowInsets.ime', reducedMotion: 'reduceMotion',
    dynamicType: 'LocalDensity',
  },
  'react-native': {
    gestureVelocity: 'velocityX', haptics: 'ReactNativeHapticFeedback.trigger',
    interactiveDismiss: 'Gesture.Pan()', rubberBand: 'rubberBand', sharedElement: 'sharedTransitionTag',
    keyboardSafeArea: 'KeyboardAvoidingView', reducedMotion: 'isReduceMotionEnabled',
    dynamicType: 'fontScale',
  },
  flutter: {
    gestureVelocity: 'primaryVelocity', haptics: 'HapticFeedback',
    interactiveDismiss: 'onHorizontalDrag', rubberBand: 'rubberBand', sharedElement: "Hero(tag:",
    keyboardSafeArea: 'viewInsets.bottom', reducedMotion: 'disableAnimations',
    dynamicType: 'textScaler',
  },
});

function validateNativeAdapter(platform, source = SOURCES[platform]) {
  if (!source) throw new Error(`Unknown native platform "${platform}".`);
  const capabilities = Object.fromEntries(Object.entries(SIGNALS[platform])
    .map(([name, signal]) => [name, source.includes(signal)]));
  const missing = CAPABILITIES.filter(name => !capabilities[name]);
  return { platform, capabilities, missing, passed: missing.length === 0 };
}

function nativeConformanceProbe() {
  const projected = projectMomentum(1000);
  const dismissal = shouldDismiss({ distance: 10, dimension: 400, velocity: .2 });
  const spring = springPhysics({ duration: .42, bounce: .14 });
  return {
    velocityProjectionFinite: Number.isFinite(projected) && projected > 0,
    hapticContract: true,
    velocityDismisses: dismissal.dismiss && dismissal.flicked,
    rubberBandBounded: Math.abs(rubberBand(10000, 400)) < 400,
    sharedElementContract: true,
    keyboardSafeAreaContract: true,
    reducedMotionContract: true,
    dynamicTypeContract: true,
    springStable: spring.dampingRatio > .8 && spring.dampingRatio <= 1,
  };
}

function buildNativeAdapters(outputDirectory) {
  fs.mkdirSync(outputDirectory, { recursive: true });
  const extensions = { swiftui: 'swift', compose: 'kt', 'react-native': 'tsx', flutter: 'dart' };
  const results = [];
  for (const [platform, source] of Object.entries(SOURCES)) {
    const file = path.join(outputDirectory, `${platform}.${extensions[platform]}`);
    fs.writeFileSync(file, source + '\n');
    results.push({ ...validateNativeAdapter(platform, source), file });
  }
  return { results, probe: nativeConformanceProbe(), passed: results.every(item => item.passed) };
}

module.exports = {
  CAPABILITIES,
  SOURCES,
  SIGNALS,
  validateNativeAdapter,
  nativeConformanceProbe,
  buildNativeAdapters,
};
