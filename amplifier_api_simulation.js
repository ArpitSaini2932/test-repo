/**
 * EEG Amplifier API Simulation
 * This module simulates a real EEG amplifier connection and can be adapted for actual hardware
 */

class EEGAmplifierAPI {
  constructor(config = {}) {
    this.config = {
      deviceId: config.deviceId || 'EEG-AMP-001',
      sampleRate: config.sampleRate || 250, // Hz
      channels: config.channels || 32,
      gain: config.gain || 1000,
      highpassFilter: config.highpassFilter || 0.5, // Hz
      lowpassFilter: config.lowpassFilter || 100, // Hz
      notchFilter: config.notchFilter || 50, // Hz (50/60Hz power line)
      impedanceThreshold: config.impedanceThreshold || 5000, // Ohms
      ...config
    };
    
    this.isConnected = false;
    this.isRecording = false;
    this.connectionQuality = {};
    this.realTimeData = {};
    this.callbacks = {
      onData: null,
      onConnection: null,
      onError: null,
      onImpedance: null
    };
    
    this.electrodePositions = {
      'Fp1': { x: -20, y: 90, z: 30 },
      'Fp2': { x: 20, y: 90, z: 30 },
      'F7': { x: -65, y: 65, z: 10 },
      'F3': { x: -35, y: 60, z: 50 },
      'Fz': { x: 0, y: 65, z: 60 },
      'F4': { x: 35, y: 60, z: 50 },
      'F8': { x: 65, y: 65, z: 10 },
      'T7': { x: -80, y: 0, z: -10 },
      'C3': { x: -45, y: 0, z: 70 },
      'Cz': { x: 0, y: 0, z: 85 },
      'C4': { x: 45, y: 0, z: 70 },
      'T8': { x: 80, y: 0, z: -10 },
      'P7': { x: -65, y: -65, z: 10 },
      'P3': { x: -35, y: -60, z: 50 },
      'Pz': { x: 0, y: -65, z: 60 },
      'P4': { x: 35, y: -60, z: 50 },
      'P8': { x: 65, y: -65, z: 10 },
      'O1': { x: -20, y: -90, z: 30 },
      'O2': { x: 20, y: -90, z: 30 }
    };
    
    this.frequencyBands = {
      delta: { min: 0.5, max: 4, color: '#e74c3c' },
      theta: { min: 4, max: 8, color: '#f39c12' },
      alpha: { min: 8, max: 13, color: '#2ecc71' },
      beta: { min: 13, max: 30, color: '#3498db' },
      gamma: { min: 30, max: 100, color: '#9b59b6' }
    };
    
    this.init();
  }
  
  init() {
    console.log(`Initializing EEG Amplifier ${this.config.deviceId}`);
    this.simulateConnection();
  }
  
  // Device Connection Management
  async connect() {
    try {
      console.log('Attempting to connect to EEG amplifier...');
      
      // Simulate connection delay
      await this.delay(2000);
      
      this.isConnected = true;
      this.startImpedanceMonitoring();
      
      const connectionInfo = {
        deviceId: this.config.deviceId,
        firmwareVersion: '2.1.4',
        serialNumber: 'EEG-2024-001',
        batteryLevel: 85,
        temperature: 23.5,
        timestamp: new Date().toISOString()
      };
      
      if (this.callbacks.onConnection) {
        this.callbacks.onConnection(connectionInfo);
      }
      
      console.log('EEG Amplifier connected successfully');
      return connectionInfo;
      
    } catch (error) {
      this.handleError('Connection failed', error);
      throw error;
    }
  }
  
  disconnect() {
    this.stopRecording();
    this.isConnected = false;
    this.connectionQuality = {};
    console.log('EEG Amplifier disconnected');
  }
  
  // Recording Control
  async startRecording() {
    if (!this.isConnected) {
      throw new Error('Amplifier not connected');
    }
    
    if (this.isRecording) {
      throw new Error('Recording already in progress');
    }
    
    console.log('Starting EEG recording...');
    this.isRecording = true;
    
    // Initialize real-time data streams
    Object.keys(this.electrodePositions).forEach(electrode => {
      this.realTimeData[electrode] = {
        signal: [],
        quality: Math.random() > 0.8 ? 'poor' : 'good',
        impedance: Math.random() * 10000,
        saturation: false
      };
    });
    
    this.startDataAcquisition();
  }
  
  stopRecording() {
    if (!this.isRecording) return;
    
    console.log('Stopping EEG recording...');
    this.isRecording = false;
    
    if (this.dataInterval) {
      clearInterval(this.dataInterval);
      this.dataInterval = null;
    }
  }
  
  // Signal Processing Configuration
  setGain(gain) {
    if (gain < 100 || gain > 50000) {
      throw new Error('Gain must be between 100 and 50000');
    }
    this.config.gain = gain;
    console.log(`Amplifier gain set to ${gain}x`);
  }
  
  setFilters(highpass, lowpass, notch = null) {
    if (highpass >= lowpass) {
      throw new Error('Highpass frequency must be less than lowpass frequency');
    }
    
    this.config.highpassFilter = highpass;
    this.config.lowpassFilter = lowpass;
    
    if (notch) {
      this.config.notchFilter = notch;
    }
    
    console.log(`Filters updated: HP=${highpass}Hz, LP=${lowpass}Hz, Notch=${notch || 'off'}Hz`);
  }
  
  setSampleRate(sampleRate) {
    const validRates = [125, 250, 500, 1000, 2000];
    if (!validRates.includes(sampleRate)) {
      throw new Error(`Invalid sample rate. Valid rates: ${validRates.join(', ')}`);
    }
    
    this.config.sampleRate = sampleRate;
    console.log(`Sample rate set to ${sampleRate}Hz`);
  }
  
  // Data Acquisition
  startDataAcquisition() {
    const intervalMs = 1000 / this.config.sampleRate;
    
    this.dataInterval = setInterval(() => {
      if (!this.isRecording) return;
      
      const timestamp = Date.now();
      const sampleData = this.generateRealisticEEGData(timestamp);
      
      if (this.callbacks.onData) {
        this.callbacks.onData({
          timestamp,
          sampleRate: this.config.sampleRate,
          channels: sampleData,
          quality: this.getOverallQuality(),
          batteryLevel: this.getBatteryLevel()
        });
      }
      
    }, intervalMs);
  }
  
  generateRealisticEEGData(timestamp) {
    const time = timestamp / 1000;
    const data = {};
    
    Object.keys(this.electrodePositions).forEach(electrode => {
      let signal = 0;
      
      // Generate frequency-specific components based on electrode location
      const position = this.electrodePositions[electrode];
      
      // Alpha rhythm (8-13 Hz) - stronger in occipital regions
      if (electrode.startsWith('O')) {
        signal += Math.sin(2 * Math.PI * 10 * time) * 50;
      } else {
        signal += Math.sin(2 * Math.PI * 10 * time) * 20;
      }
      
      // Beta activity (14-30 Hz) - stronger in frontal/central regions
      if (electrode.startsWith('F') || electrode.startsWith('C')) {
        signal += Math.sin(2 * Math.PI * 20 * time) * 30;
      } else {
        signal += Math.sin(2 * Math.PI * 20 * time) * 15;
      }
      
      // Theta waves (4-7 Hz) - general distribution
      signal += Math.sin(2 * Math.PI * 6 * time) * 25;
      
      // Delta waves (0.5-4 Hz) - deeper sleep/pathological
      signal += Math.sin(2 * Math.PI * 2 * time) * 40;
      
      // Muscle artifacts (50-200 Hz) - stronger in temporal regions
      if (electrode.includes('T') || electrode.includes('7') || electrode.includes('8')) {
        signal += Math.sin(2 * Math.PI * 80 * time) * (Math.random() * 20);
      }
      
      // Eye movement artifacts - stronger in frontal electrodes
      if (electrode.startsWith('Fp')) {
        signal += Math.sin(2 * Math.PI * 0.5 * time) * (Math.random() * 100);
      }
      
      // Add realistic noise
      signal += (Math.random() - 0.5) * 10;
      
      // Apply gain
      signal *= (this.config.gain / 1000);
      
      // Apply electrode-specific quality
      const quality = this.realTimeData[electrode]?.quality || 'good';
      if (quality === 'poor') {
        signal += (Math.random() - 0.5) * 50; // More noise for poor connections
      }
      
      data[electrode] = signal;
    });
    
    return data;
  }
  
  // Impedance Monitoring
  startImpedanceMonitoring() {
    this.impedanceInterval = setInterval(() => {
      if (!this.isConnected) return;
      
      const impedanceData = {};
      
      Object.keys(this.electrodePositions).forEach(electrode => {
        // Simulate impedance variations
        const baseImpedance = 2000 + Math.random() * 8000;
        const currentImpedance = baseImpedance + (Math.random() - 0.5) * 1000;
        
        impedanceData[electrode] = {
          value: Math.max(0, currentImpedance),
          status: currentImpedance < this.config.impedanceThreshold ? 'good' : 'high',
          timestamp: Date.now()
        };
        
        // Update connection quality
        this.connectionQuality[electrode] = impedanceData[electrode].status;
      });
      
      if (this.callbacks.onImpedance) {
        this.callbacks.onImpedance(impedanceData);
      }
      
    }, 5000); // Check every 5 seconds
  }
  
  // Event Callbacks
  onData(callback) {
    this.callbacks.onData = callback;
  }
  
  onConnection(callback) {
    this.callbacks.onConnection = callback;
  }
  
  onError(callback) {
    this.callbacks.onError = callback;
  }
  
  onImpedance(callback) {
    this.callbacks.onImpedance = callback;
  }
  
  // Utility Methods
  getOverallQuality() {
    const qualities = Object.values(this.connectionQuality);
    const goodConnections = qualities.filter(q => q === 'good').length;
    const totalConnections = qualities.length;
    
    if (totalConnections === 0) return 'unknown';
    
    const percentage = (goodConnections / totalConnections) * 100;
    
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'fair';
    return 'poor';
  }
  
  getBatteryLevel() {
    // Simulate battery drain
    const runtime = (Date.now() - this.startTime) / 1000 / 3600; // hours
    return Math.max(0, 100 - runtime * 5); // 5% per hour
  }
  
  simulateConnection() {
    this.startTime = Date.now();
  }
  
  handleError(message, error) {
    console.error(`EEG Amplifier Error: ${message}`, error);
    
    if (this.callbacks.onError) {
      this.callbacks.onError({
        message,
        error,
        timestamp: new Date().toISOString(),
        deviceId: this.config.deviceId
      });
    }
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Device Information
  getDeviceInfo() {
    return {
      deviceId: this.config.deviceId,
      isConnected: this.isConnected,
      isRecording: this.isRecording,
      sampleRate: this.config.sampleRate,
      channels: Object.keys(this.electrodePositions).length,
      batteryLevel: this.getBatteryLevel(),
      quality: this.getOverallQuality(),
      firmwareVersion: '2.1.4',
      lastUpdate: new Date().toISOString()
    };
  }
  
  // Signal Analysis Utilities
  analyzeSignalQuality(channelData, electrode) {
    if (!channelData || channelData.length < 10) {
      return { quality: 'unknown', metrics: {} };
    }
    
    // Calculate signal metrics
    const mean = channelData.reduce((a, b) => a + b, 0) / channelData.length;
    const variance = channelData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / channelData.length;
    const rms = Math.sqrt(channelData.reduce((a, b) => a + b * b, 0) / channelData.length);
    
    // Check for saturation
    const maxValue = Math.max(...channelData.map(Math.abs));
    const saturation = maxValue > 1000; // Adjust threshold as needed
    
    // Estimate SNR (simplified)
    const signalPower = variance;
    const noisePower = Math.min(variance * 0.1, 100); // Simplified noise estimation
    const snr = 10 * Math.log10(signalPower / noisePower);
    
    // Determine quality
    let quality = 'good';
    if (saturation || snr < 10) quality = 'poor';
    else if (snr < 20) quality = 'fair';
    else if (snr > 30) quality = 'excellent';
    
    return {
      quality,
      metrics: {
        mean: mean.toFixed(2),
        rms: rms.toFixed(2),
        snr: snr.toFixed(1),
        saturation,
        impedance: this.realTimeData[electrode]?.impedance || 'unknown'
      }
    };
  }
  
  // Export/Import Configuration
  exportConfiguration() {
    return {
      deviceId: this.config.deviceId,
      sampleRate: this.config.sampleRate,
      gain: this.config.gain,
      filters: {
        highpass: this.config.highpassFilter,
        lowpass: this.config.lowpassFilter,
        notch: this.config.notchFilter
      },
      impedanceThreshold: this.config.impedanceThreshold,
      electrodeLayout: this.electrodePositions,
      exportDate: new Date().toISOString()
    };
  }
  
  importConfiguration(config) {
    if (config.sampleRate) this.setSampleRate(config.sampleRate);
    if (config.gain) this.setGain(config.gain);
    if (config.filters) {
      this.setFilters(
        config.filters.highpass,
        config.filters.lowpass,
        config.filters.notch
      );
    }
    if (config.impedanceThreshold) {
      this.config.impedanceThreshold = config.impedanceThreshold;
    }
    
    console.log('Configuration imported successfully');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EEGAmplifierAPI;
} else if (typeof window !== 'undefined') {
  window.EEGAmplifierAPI = EEGAmplifierAPI;
}

// Usage Example:
/*
const amplifier = new EEGAmplifierAPI({
  deviceId: 'MyEEGDevice',
  sampleRate: 250,
  gain: 1000
});

amplifier.onData((data) => {
  console.log('Received EEG data:', data);
  // Process real-time data here
});

amplifier.onConnection((info) => {
  console.log('Connected to device:', info);
});

amplifier.onError((error) => {
  console.error('Device error:', error);
});

// Connect and start recording
amplifier.connect().then(() => {
  amplifier.startRecording();
});
*/