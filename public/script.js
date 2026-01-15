// Client-side logic: submit form via fetch, show stats, preview and download link
const form = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const result = document.getElementById('result');
const filenameEl = document.getElementById('filename');
const originalSizeEl = document.getElementById('originalSize');
const compressedSizeEl = document.getElementById('compressedSize');
const ratioEl = document.getElementById('ratio');
const preview = document.getElementById('preview');
const downloadLink = document.getElementById('downloadLink');
const raw = document.getElementById('raw');
const submitBtn = document.getElementById('submitBtn');
const spinner = document.getElementById('spinner');
const fileDrop = document.querySelector('.file-drop');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) return alert('Please choose a file');

  const fd = new FormData();
  fd.append('file', file, file.name);

  // Clear previous
  result.classList.add('hidden');
  raw.textContent = '';
  submitBtn.disabled = true;
  spinner.classList.remove('hidden');

  try {
    const resp = await fetch('/compress', { method: 'POST', body: fd });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: 'Unknown error' }));
      return alert('Error: ' + (err.error || JSON.stringify(err)));
    }
    const data = await resp.json();

    filenameEl.textContent = data.filename;
    originalSizeEl.textContent = data.originalSizeHuman + ` (${data.originalSize} bytes)`;
    compressedSizeEl.textContent = data.compressedSizeHuman + ` (${data.compressedSize} bytes)`;
    ratioEl.textContent = data.ratio ? data.ratio : '—';

    preview.src = data.dataUrl;

    // Create a blob for download and set download filename keeping extension
    const b = await (await fetch(data.dataUrl)).blob();
    const url = URL.createObjectURL(b);
    downloadLink.href = url;
    downloadLink.download = data.filename; // keeps original name & extension

    raw.textContent = JSON.stringify(data, null, 2);
    result.classList.remove('hidden');
    submitBtn.disabled = false;
    spinner.classList.add('hidden');
  } catch (err) {
    alert('Upload failed: ' + err.message);
    console.error(err);
    submitBtn.disabled = false;
    spinner.classList.add('hidden');
  }
});

// Drag & drop support for .file-drop area
if (fileDrop) {
  ['dragenter','dragover'].forEach(evt => fileDrop.addEventListener(evt, (e)=>{ e.preventDefault(); fileDrop.classList.add('dragover'); }));
  ['dragleave','drop'].forEach(evt => fileDrop.addEventListener(evt, (e)=>{ e.preventDefault(); fileDrop.classList.remove('dragover'); }));
  fileDrop.addEventListener('drop', (e)=>{
    if (!e.dataTransfer) return;
    const f = e.dataTransfer.files[0];
    if (f) fileInput.files = e.dataTransfer.files;
  });
}
