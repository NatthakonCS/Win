// --- ตัวแปรหลัก ---
let currentWins = 0;
let targetWins = 5;
let hotkeyPlusCode = null;
let hotkeyMinusCode = null;

// อ้างอิง Element ต่างๆ ใน HTML
const currentWinInput = document.getElementById('currentWinInput');
const targetWinInput = document.getElementById('targetWinInput');
const btnPlus = document.getElementById('btnPlus');
const btnMinus = document.getElementById('btnMinus');
const btnReset = document.getElementById('btnReset');
const hotkeyPlusInput = document.getElementById('hotkeyPlus');
const hotkeyMinusInput = document.getElementById('hotkeyMinus');
const soundPlusUrlInput = document.getElementById('soundPlusUrl');
const soundMinusUrlInput = document.getElementById('soundMinusUrl');
const audioPlayer = document.getElementById('audioPlayer');
const overlayLinkOutput = document.getElementById('overlayLinkOutput');
const btnCopyLink = document.getElementById('btnCopyLink');

// --- ฟังก์ชันเริ่มต้น (Initialization) ---
function init() {
    // โหลดข้อมูลเก่าที่เคยบันทึกไว้ (ถ้ามี)
    loadFromStorage();

    // อัปเดตหน้าจอแผงควบคุมให้ตรงกับข้อมูล
    currentWinInput.value = currentWins;
    targetWinInput.value = targetWins;
    if(hotkeyPlusCode) hotkeyPlusInput.value = formatHotkeyDisplay(hotkeyPlusCode);
    if(hotkeyMinusCode) hotkeyMinusInput.value = formatHotkeyDisplay(hotkeyMinusCode);

    // สร้างลิงก์ Overlay อัตโนมัติ
    const currentURL = window.location.href;
    const overlayURL = currentURL.substring(0, currentURL.lastIndexOf('/')) + '/overlay.html';
    overlayLinkOutput.value = overlayURL;

    setupEventListeners();
    // บันทึกสถานะเริ่มต้นลง LocalStorage เพื่อให้ Overlay เห็นทันที
    saveToStorage();
}

// --- ฟังก์ชันจัดการข้อมูล (Data & Storage) ---
function saveToStorage() {
    localStorage.setItem('stream_wins', currentWins);
    localStorage.setItem('stream_target', targetWins);
    localStorage.setItem('stream_hotkey_plus', hotkeyPlusCode || '');
    localStorage.setItem('stream_hotkey_minus', hotkeyMinusCode || '');
    // เราไม่บันทึก URL เสียงลง storage เพื่อความรวดเร็ว ให้ browser จำค่า input เอง
}

function loadFromStorage() {
    currentWins = parseInt(localStorage.getItem('stream_wins')) || 0;
    targetWins = parseInt(localStorage.getItem('stream_target')) || 5;
    hotkeyPlusCode = localStorage.getItem('stream_hotkey_plus') || null;
    hotkeyMinusCode = localStorage.getItem('stream_hotkey_minus') || null;
}

// --- ฟังก์ชันการทำงานหลัก (Actions) ---
function incrementWins() {
    currentWins++;
    currentWinInput.value = currentWins;
    playSound(soundPlusUrlInput.value);
    saveToStorage();
}

function decrementWins() {
    if (currentWins > 0) {
        currentWins--;
        currentWinInput.value = currentWins;
        playSound(soundMinusUrlInput.value);
        saveToStorage();
    }
}

function resetWins() {
    currentWins = 0;
    currentWinInput.value = currentWins;
    // ไม่เล่นเสียงตอนรีเซ็ต หรือถ้าอยากเล่นก็เพิ่ม playSound(...) ที่นี่
    saveToStorage();
}

function playSound(url) {
    if (url) {
        audioPlayer.src = url;
        // ปรับระดับเสียงให้เบาลงหน่อย (0.0 - 1.0)
        audioPlayer.volume = 0.5; 
        audioPlayer.play().catch(e => console.log("Error playing sound:", e));
    }
}

// --- การจัดการ Event Listeners ---
function setupEventListeners() {
    // ปุ่มกด
    btnPlus.addEventListener('click', incrementWins);
    btnMinus.addEventListener('click', decrementWins);
    btnReset.addEventListener('click', resetWins);

    // การพิมพ์ตัวเลขในช่อง Input โดยตรง
    currentWinInput.addEventListener('change', (e) => {
        currentWins = parseInt(e.target.value) || 0;
        saveToStorage();
    });
    targetWinInput.addEventListener('change', (e) => {
        targetWins = parseInt(e.target.value) || 1;
        saveToStorage();
    });

    // การตั้งค่า Hotkeys
    setupHotkeyInput(hotkeyPlusInput, (code) => hotkeyPlusCode = code);
    setupHotkeyInput(hotkeyMinusInput, (code) => hotkeyMinusCode = code);

    // Global Hotkey Listener (จับการกดปุ่มบนคีย์บอร์ด)
    document.addEventListener('keydown', (e) => {
        // ป้องกันการกดปุ่มซ้ำหากกำลังพิมพ์อยู่ในช่อง Input
        if (e.target.tagName === 'INPUT') return;

        if (e.code === hotkeyPlusCode) {
            incrementWins();
        } else if (e.code === hotkeyMinusCode) {
            decrementWins();
        }
    });

    // ปุ่ม Copy Link
    btnCopyLink.addEventListener('click', () => {
        overlayLinkOutput.select();
        document.execCommand('copy');
        // เปลี่ยนข้อความปุ่มชั่วคราว
        const originalText = btnCopyLink.innerText;
        btnCopyLink.innerText = "Copied! ✅";
        setTimeout(() => btnCopyLink.innerText = originalText, 2000);
    });
}

// Helper สำหรับตั้งค่า Hotkey
function setupHotkeyInput(inputElement, callback) {
    inputElement.addEventListener('keydown', (e) => {
        e.preventDefault();
        const code = e.code;
        inputElement.value = formatHotkeyDisplay(code);
        callback(code);
        saveToStorage();
        inputElement.blur(); // ออกจากช่อง input หลังตั้งค่าเสร็จ
    });
}

// จัดรูปแบบชื่อปุ่มให้ดูง่ายขึ้น
function formatHotkeyDisplay(code) {
    return code.replace('Key', '').replace('Digit', '');
}

// เริ่มทำงานเมื่อโหลดหน้าเว็บ
document.addEventListener('DOMContentLoaded', init);