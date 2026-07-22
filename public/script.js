const fileInp = document.getElementById('fileInp');
const dropZone = document.getElementById('dropZone');
const fileTxt = document.getElementById('fileTxt');
const fileName = document.getElementById('fileName');

dropZone.onclick = () => fileInp.click();

fileInp.onchange = (e) => {
    if (e.target.files[0]) showFile(e.target.files[0]);
};

dropZone.ondragover = (e) => {
    e.preventDefault();
    dropZone.classList.add('drag');
};

dropZone.ondragleave = () => dropZone.classList.remove('drag');

dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag');
    if (e.dataTransfer.files[0]) {
        fileInp.files = e.dataTransfer.files;
        showFile(e.dataTransfer.files[0]);
    }
};

function showFile(file) {
    const size = (file.size / 1024 / 1024).toFixed(2);
    fileTxt.textContent = 'Ready! ✅';
    fileName.textContent = `${file.name} (${size} MB)`;
}

document.getElementById('form').onsubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const btn = document.getElementById('btn');
    const prog = document.getElementById('prog');
    const bar = document.getElementById('bar');
    const pct = document.getElementById('pct');
    const result = document.getElementById('result');

    const file = fileInp.files[0];
    if (file && file.size > 50 * 1024 * 1024) {
        result.innerHTML = '<div class="err">❌ File 50MB se badi nahi!</div>';
        return;
    }

    const data = new FormData(form);
    btn.disabled = true;
    btn.textContent = '⏳ Uploading...';
    prog.style.display = 'block';
    result.innerHTML = '';

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
            const p = Math.round((e.loaded / e.total) * 100);
            bar.style.width = p + '%';
            pct.textContent = p + '%';
        }
    };

    xhr.onload = () => {
        if (xhr.status === 200) {
            const r = JSON.parse(xhr.responseText);
            result.innerHTML = `<div class="ok">✅ ${r.message}</div>`;
            form.reset();
            fileTxt.textContent = 'Click ya Drop karo';
            fileName.textContent = '';
        } else {
            const r = JSON.parse(xhr.responseText);
            result.innerHTML = `<div class="err">❌ ${r.error}</div>`;
        }
        btn.disabled = false;
        btn.textContent = '🚀 Upload';
        prog.style.display = 'none';
    };

    xhr.onerror = () => {
        result.innerHTML = '<div class="err">❌ Error!</div>';
        btn.disabled = false;
        btn.textContent = '🚀 Upload';
        prog.style.display = 'none';
    };

    xhr.open('POST', '/api/upload');
    xhr.send(data);
};
