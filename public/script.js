// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    
    const fileInp = document.getElementById('fileInp');
    const dropZone = document.getElementById('dropZone');
    const fileTxt = document.getElementById('fileTxt');
    const fileName = document.getElementById('fileName');
    const form = document.getElementById('form');
    const btn = document.getElementById('btn');
    const prog = document.getElementById('prog');
    const bar = document.getElementById('bar');
    const pct = document.getElementById('pct');
    const result = document.getElementById('result');

    // Click to upload
    if (dropZone) {
        dropZone.onclick = function() {
            fileInp.click();
        };
    }

    // File selected
    if (fileInp) {
        fileInp.onchange = function(e) {
            if (e.target.files[0]) {
                showFile(e.target.files[0]);
            }
        };
    }

    // Drag & Drop
    if (dropZone) {
        dropZone.ondragover = function(e) {
            e.preventDefault();
            dropZone.classList.add('drag');
        };

        dropZone.ondragleave = function() {
            dropZone.classList.remove('drag');
        };

        dropZone.ondrop = function(e) {
            e.preventDefault();
            dropZone.classList.remove('drag');
            if (e.dataTransfer.files[0]) {
                fileInp.files = e.dataTransfer.files;
                showFile(e.dataTransfer.files[0]);
            }
        };
    }

    function showFile(file) {
        const size = (file.size / 1024 / 1024).toFixed(2);
        if (fileTxt) fileTxt.textContent = 'Ready to upload! ✅';
        if (fileName) fileName.textContent = `${file.name} (${size} MB)`;
        if (dropZone) dropZone.classList.add('file-selected');
    }

    // Form Submit - MAIN LOGIC
    if (form) {
        form.onsubmit = function(e) {
            e.preventDefault();
            console.log('Form submitted'); // Debug
            
            if (!fileInp.files[0]) {
                result.innerHTML = '<div class="err">❌ Please select a file!</div>';
                return;
            }

            const file = fileInp.files[0];
            
            // Check file size (4MB for Vercel free)
            if (file.size > 4 * 1024 * 1024) {
                result.innerHTML = '<div class="err">❌ File too large! Max 4MB allowed.</div>';
                return;
            }

            const data = new FormData(form);
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> Uploading...';
            prog.style.display = 'block';
            result.innerHTML = '';

            const xhr = new XMLHttpRequest();

            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    const p = Math.round((e.loaded / e.total) * 100);
                    bar.style.width = p + '%';
                    pct.textContent = p + '%';
                }
            };

            xhr.onload = function() {
                console.log('Response:', xhr.status, xhr.responseText);
                if (xhr.status === 200) {
                    try {
                        const r = JSON.parse(xhr.responseText);
                        result.innerHTML = `
                            <div class="ok">
                                <div class="success-icon">✅</div>
                                <h3>Upload Successful!</h3>
                                <p>${r.message}</p>
                                <p>Admin ko file mil gayi hai!</p>
                            </div>
                        `;
                        form.reset();
                        fileTxt.textContent = 'Click ya Drop karo';
                        fileName.textContent = '';
                        dropZone.classList.remove('file-selected');
                    } catch (err) {
                        result.innerHTML = '<div class="err">❌ Error parsing response</div>';
                    }
                } else {
                    let errMsg = 'Upload failed';
                    try {
                        const r = JSON.parse(xhr.responseText);
                        errMsg = r.error || errMsg;
                    } catch (e) {}
                    result.innerHTML = `<div class="err">❌ ${errMsg}</div>`;
                }
                btn.disabled = false;
                btn.innerHTML = '🚀 Upload File';
                prog.style.display = 'none';
            };

            xhr.onerror = function() {
                result.innerHTML = '<div class="err">❌ Network error! Try again.</div>';
                btn.disabled = false;
                btn.innerHTML = '🚀 Upload File';
                prog.style.display = 'none';
            };

            xhr.open('POST', '/api/upload');
            xhr.send(data);
        };
    }
});
