'use strict';
const fs=require('fs'),path=require('path');const {compileScene}=require('../../motion-scene-compiler');
function execute(args,ctx){const brief=ctx.argValue(args,'--brief',''),result=compileScene({sceneId:ctx.argValue(args,'--scene',''),brief,seed:ctx.argValue(args,'--seed',brief),intensity:ctx.argValue(args,'--intensity','8')}),out=ctx.argValue(args,'--out','');if(out){const file=path.resolve(ctx.cwd,out);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(result,null,2)+'\n');ctx.ok(`Compiled MotionOS scene ${result.scene.id}: ${path.relative(ctx.cwd,file)}`)}else process.stdout.write(JSON.stringify(result,null,2)+'\n')}
module.exports={execute};
