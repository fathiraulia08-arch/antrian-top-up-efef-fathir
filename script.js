// Inisialisasi data sistem antrian
let queueData = {
    currentNumber: 1,
    calledNumber: null,
    calledOperator: null,
    totalQueues: 0,
    calledQueues: 0,
    waitingQueues: 0,
    operators: [
        { id: 1, name: "Operator 1 (Pendaftaran)", status: "active" },
        { id: 2, name: "Operator 2 (Verifikasi Berkas)", status: "active" },
        { id: 3, name: "Operator 3 (Wawancara)", status: "active" },
        { id: 4, name: "Operator 4 (Tes Akademik)", status: "active" },
        { id: 5, name: "Operator 5 (Tes Psikologi)", status: "active" },
        { id: 6, name: "Operator 6 (Pembayaran)", status: "active" },
        { id: 7, name: "Operator 7 (Kesehatan)", status: "active" },
        { id: 8, name: "Operator 8 (Penentuan Jurusan)", status: "active" }
    ],
    queueHistory: []
};

// Elemen DOM
const currentNumberElement = document.getElementById('current-number');
const currentOperatorElement = document.getElementById('current-operator');
const queueStatusElement = document.getElementById('queue-status');
const calledNumberElement = document.getElementById('called-number');
const calledOperatorElement = document.getElementById('called-operator');
const totalQueuesElement = document.getElementById('total-queues');
const calledQueuesElement = document.getElementById('called-queues');
const waitingQueuesElement = document.getElementById('waiting-queues');
const queueNumberInput = document.getElementById('queue-number');
const operatorSelect = document.getElementById('operator-select');
const callButton = document.getElementById('call-btn');
const nextButton = document.getElementById('next-btn');
const decreaseButton = document.getElementById('decrease-btn');
const increaseButton = document.getElementById('increase-btn');
const resetButton = document.getElementById('reset-btn');
const testVoiceButton = document.getElementById('test-voice-btn');
const volumeSlider = document.getElementById('volume-slider');
const volumeValueElement = document.getElementById('volume-value');
const operatorGridElement = document.getElementById('operator-grid');
const queueAudio = document.getElementById('queue-audio');

// Inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    initSystem();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    renderOperatorStatus();
});

// Inisialisasi sistem
function initSystem() {
    // Format nomor antrian awal
    updateQueueDisplay();
    
    // Event listener untuk tombol panggil
    callButton.addEventListener('click', callQueue);
    
    // Event listener untuk tombol berikutnya
    nextButton.addEventListener('click', nextQueue);
    
    // Event listener untuk tombol kontrol nomor
    decreaseButton.addEventListener('click', () => changeQueueNumber(-1));
    increaseButton.addEventListener('click', () => changeQueueNumber(1));
    resetButton.addEventListener('click', resetQueueNumber);
    
    // Event listener untuk test suara
    testVoiceButton.addEventListener('click', testVoice);
    
    // Event listener untuk volume slider
    volumeSlider.addEventListener('input', updateVolume);
    
    // Event listener untuk input manual nomor antrian
    queueNumberInput.addEventListener('change', validateQueueNumber);
    
    // Update statistik awal
    updateStatistics();
}

// Update tanggal dan waktu
function updateDateTime() {
    const now = new Date();
    
    // Format tanggal
    const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('id-ID', optionsDate);
    document.getElementById('current-date').textContent = formattedDate;
    
    // Format waktu
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('current-time').textContent = `${hours}:${minutes}:${seconds}`;
}

// Update tampilan antrian
function updateQueueDisplay() {
    const formattedNumber = queueData.currentNumber.toString().padStart(3, '0');
    currentNumberElement.textContent = formattedNumber;
    queueNumberInput.value = formattedNumber;
    
    currentOperatorElement.textContent = operatorSelect.value;
}

// Ubah nomor antrian
function changeQueueNumber(change) {
    let newNumber = parseInt(queueData.currentNumber) + change;
    
    // Pastikan nomor tidak kurang dari 1
    if (newNumber < 1) newNumber = 1;
    if (newNumber > 999) newNumber = 999;
    
    queueData.currentNumber = newNumber;
    updateQueueDisplay();
}

// Reset nomor antrian ke 1
function resetQueueNumber() {
    queueData.currentNumber = 1;
    updateQueueDisplay();
}

// Validasi input manual nomor antrian
function validateQueueNumber() {
    let value = parseInt(queueNumberInput.value);
    
    if (isNaN(value) || value < 1) {
        value = 1;
    } else if (value > 999) {
        value = 999;
    }
    
    queueData.currentNumber = value;
    updateQueueDisplay();
}

// Panggil antrian
function callQueue() {
    const queueNumber = queueData.currentNumber.toString().padStart(3, '0');
    const operator = operatorSelect.value;
    
    // Update data
    queueData.calledNumber = queueNumber;
    queueData.calledOperator = operator;
    queueData.calledQueues++;
    queueData.totalQueues++;
    
    // Update UI
    calledNumberElement.textContent = queueNumber;
    calledOperatorElement.textContent = operator;
    queueStatusElement.textContent = "Dipanggil";
    queueStatusElement.style.color = "#27ae60";
    
    // Tambahkan ke riwayat
    queueData.queueHistory.push({
        number: queueNumber,
        operator: operator,
        time: new Date().toLocaleTimeString('id-ID')
    });
    
    // Update operator status menjadi sibuk
    const operatorIndex = getOperatorIndex(operator);
    if (operatorIndex !== -1) {
        queueData.operators[operatorIndex].status = "busy";
        renderOperatorStatus();
    }
    
    // Update statistik
    updateStatistics();
    
    // Putar suara panggilan
    playQueueCall(queueNumber, operator);
    
    // Auto increment untuk antrian berikutnya
    setTimeout(() => {
        queueData.currentNumber++;
        updateQueueDisplay();
        queueStatusElement.textContent = "Menunggu";
        queueStatusElement.style.color = "#e84118";
    }, 3000);
}

// Ambil indeks operator berdasarkan nama
function getOperatorIndex(operatorName) {
    // Ambil hanya nama operator tanpa keterangan
    const baseName = operatorName.split(" ")[0] + " " + operatorName.split(" ")[1];
    
    for (let i = 0; i < queueData.operators.length; i++) {
        if (queueData.operators[i].name.includes(baseName)) {
            return i;
        }
    }
    return -1;
}

// Antrian berikutnya
function nextQueue() {
    // Reset operator yang sibuk menjadi aktif setelah beberapa detik
    setTimeout(() => {
        const operatorIndex = getOperatorIndex(queueData.calledOperator);
        if (operatorIndex !== -1) {
            queueData.operators[operatorIndex].status = "active";
            renderOperatorStatus();
        }
    }, 5000);
    
    // Update statistik antrian menunggu
    if (queueData.totalQueues > queueData.calledQueues) {
        queueData.waitingQueues = queueData.totalQueues - queueData.calledQueues;
        updateStatistics();
    }
}

// Update statistik
function updateStatistics() {
    totalQueuesElement.textContent = queueData.totalQueues;
    calledQueuesElement.textContent = queueData.calledQueues;
    waitingQueuesElement.textContent = queueData.waitingQueues;
}

// Render status operator
function renderOperatorStatus() {
    operatorGridElement.innerHTML = '';
    
    queueData.operators.forEach(operator => {
        const operatorItem = document.createElement('div');
        operatorItem.className = `operator-item ${operator.status}`;
        
        const operatorName = document.createElement('div');
        operatorName.className = 'operator-name';
        operatorName.textContent = operator.name;
        
        const operatorStatus = document.createElement('div');
        operatorStatus.className = `operator-status-text ${operator.status}`;
        operatorStatus.textContent = operator.status === 'active' ? 'Tersedia' : 'Sibuk';
        
        operatorItem.appendChild(operatorName);
        operatorItem.appendChild(operatorStatus);
        operatorGridElement.appendChild(operatorItem);
    });
}

// Main function untuk memanggil antrian dengan suara
function playQueueCall(queueNumber, operator) {
    // Format nomor antrian untuk diucapkan (contoh: 023 menjadi "nol dua tiga")
    const numberText = queueNumber.split('').map(digit => {
        switch(digit) {
            case '0': return 'nol';
            case '1': return 'satu';
            case '2': return 'dua';
            case '3': return 'tiga';
            case '4': return 'empat';
            case '5': return 'lima';
            case '6': return 'enam';
            case '7': return 'tujuh';
            case '8': return 'delapan';
            case '9': return 'sembilan';
            default: return digit;
        }
    }).join(' ');
    
    // Teks yang akan diucapkan
    const textToSpeak = `Nomor antrian ${numberText}, silahkan menuju ke ${operator}. Terima kasih.`;
    
    // Gunakan Web Speech API untuk sintesis suara
    if ('speechSynthesis' in window) {
        // Hentikan pembicaraan yang sedang berlangsung
        speechSynthesis.cancel();
        
        // Buat objek SpeechSynthesisUtterance
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        // Atur bahasa dan suara
        utterance.lang = 'id-ID';
        utterance.rate = 1.0; // Kecepatan bicara
        utterance.pitch = 1.0; // Tinggi nada
        utterance.volume = volumeSlider.value / 100; // Volume
        
        // Atur suara wanita jika tersedia
        const voices = speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice => 
            voice.lang === 'id-ID' && voice.name.toLowerCase().includes('female')
        );
        
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }
        
        // Mulai berbicara
        speechSynthesis.speak(utterance);
        
        // Fallback ke audio jika speech synthesis tidak berfungsi
        utterance.onerror = function(event) {
            console.error('Speech synthesis error:', event);
            playFallbackAudio();
        };
    } else {
        // Fallback untuk browser yang tidak mendukung Web Speech API
        console.warn('Web Speech API tidak didukung, menggunakan fallback audio.');
        playFallbackAudio();
    }
}

// Fallback audio menggunakan file audio (dibuat secara dinamis)
function playFallbackAudio() {
    // Di implementasi nyata, Anda akan memiliki file audio yang sudah direkam
    // Di sini kita hanya akan memainkan beep sebagai contoh
    queueAudio.volume = volumeSlider.value / 100;
    
    // Buat beep sederhana
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.5, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 1);
    
    // Tampilkan notifikasi
    alert(`Nomor antrian ${queueData.calledNumber}, silahkan menuju ke ${queueData.calledOperator}.`);
}

// Test suara
function testVoice() {
    const testText = "Ini adalah test suara untuk sistem antrian S P M B SMA Negeri 1 Magetan.";
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(testText);
        utterance.lang = 'id-ID';
        utterance.volume = volumeSlider.value / 100;
        
        // Cari suara wanita
        const voices = speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice => 
            voice.lang === 'id-ID' && voice.name.toLowerCase().includes('female')
        );
        
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }
        
        speechSynthesis.speak(utterance);
    } else {
        alert("Browser Anda tidak mendukung sintesis suara. Pastikan Anda menggunakan browser modern seperti Chrome atau Edge.");
    }
}

// Update volume
function updateVolume() {
    const volume = volumeSlider.value;
    volumeValueElement.textContent = volume;
    
    // Set volume untuk audio fallback
    queueAudio.volume = volume / 100;
}

// Simulasi data awal
function simulateInitialData() {
    // Untuk simulasi, tambahkan beberapa data antrian
    for (let i = 0; i < 5; i++) {
        queueData.totalQueues++;
        queueData.calledQueues++;
    }
    
    queueData.waitingQueues = 2;
    updateStatistics();
    
    // Set operator 3 dan 5 sebagai sibuk
    queueData.operators[2].status = "busy";
    queueData.operators[4].status = "busy";
    renderOperatorStatus();
}

// Jalankan simulasi data awal setelah halaman dimuat
setTimeout(simulateInitialData, 1000);