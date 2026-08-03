document.addEventListener('DOMContentLoaded', () => {
  const toggleInspector = document.getElementById('toggle-inspector');
  const toggleProfiler = document.getElementById('toggle-profiler');
  const runChecksBtn = document.getElementById('run-checks');
  const statusText = document.getElementById('status-text');

  // Load saved state
  chrome.storage.local.get(['inspectorEnabled', 'profilerEnabled'], (res) => {
    toggleInspector.checked = !!res.inspectorEnabled;
    toggleProfiler.checked = !!res.profilerEnabled;
  });

  toggleInspector.addEventListener('change', (e) => {
    const enabled = e.target.checked;
    chrome.storage.local.set({ inspectorEnabled: enabled });
    sendMessageToContent({ type: 'TOGGLE_INSPECTOR', payload: enabled });
  });

  toggleProfiler.addEventListener('change', (e) => {
    const enabled = e.target.checked;
    chrome.storage.local.set({ profilerEnabled: enabled });
    sendMessageToContent({ type: 'TOGGLE_PROFILER', payload: enabled });
  });

  runChecksBtn.addEventListener('click', () => {
    statusText.innerText = "Running DesignOS Checks...";
    sendMessageToContent({ type: 'RUN_CHECKS' }, (response) => {
      if (response && response.completed) {
        statusText.innerText = `Checked: ${response.issues} issues found.`;
      } else {
        statusText.innerText = "Check failed or tab not active.";
      }
    });
  });

  function sendMessageToContent(message, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, message, callback);
      }
    });
  }
});
