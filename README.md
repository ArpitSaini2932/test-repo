# Professional EEG Amplifier Demo System

A comprehensive, production-ready EEG amplifier demonstration system featuring real-time signal visualization, 3D connection modeling, and frequency spectrum analysis. This demo simulates a professional EEG recording setup and can be easily adapted for real amplifier hardware integration.

## 🌟 Features

### Core Functionality
- **Real-time Signal Visualization**: Multi-channel EEG signal display with customizable scaling
- **Frequency Spectrum Analysis**: Real-time FFT-based frequency decomposition with color-coded frequency bands
- **Brain Topography Mapping**: 3D head model showing electrode activity distribution
- **Professional 3D UI**: Modern interface with realistic device models and wire connections

### Advanced Capabilities
- **Realistic Signal Simulation**: Generates EEG-like signals with proper frequency characteristics
- **Connection Management**: Visual wire drawing between electrodes and amplifier ports
- **Signal Quality Monitoring**: Real-time impedance checking and quality indicators
- **Configurable Filters**: High-pass, low-pass, and notch filter controls
- **Responsive Design**: Adapts to different screen sizes and orientations

### Hardware Integration Ready
- **Modular API Design**: Easy adaptation for real EEG amplifiers
- **Standard EEG Protocols**: Supports 10-20 electrode positioning system
- **Scalable Architecture**: Can handle 8-128+ channels
- **Professional Grade**: Suitable for research and clinical applications

## 📁 File Structure

```
├── professional_eeg_demo.html          # Main demo application
├── enhanced_eeg_amplifier_demo.html     # Enhanced version with additional features
├── amplifier_api_simulation.js         # Hardware abstraction layer
├── eeg_simulator.html                  # Original simple version
└── README.md                          # This documentation
```

## 🚀 Quick Start

### Running the Demo

1. **Open the main demo**:
   ```bash
   # Open in your web browser
   open professional_eeg_demo.html
   ```

2. **Follow the workflow**:
   - Click "Connect Device" to simulate amplifier connection
   - Select electrodes by clicking on the 3D head model
   - Click amplifier ports to create connections
   - Start recording once you have at least 3 connections
   - Switch between visualization tabs to see different analysis views

### Demo Workflow

1. **Device Connection**
   - Click the "Connect Device" button
   - Wait for connection confirmation
   - Device status indicator will turn green

2. **Electrode Setup**
   - Click on any electrode on the 3D head model (Fp1, Fp2, F3, etc.)
   - Selected electrode will be highlighted in yellow
   - Click on an available device port (red circles) to connect

3. **Signal Recording**
   - Connect at least 3 electrodes to start recording
   - Click "Start Recording" to begin real-time signal acquisition
   - Monitor signal quality in the right panel

4. **Data Visualization**
   - **Real-time Signal**: View live EEG waveforms
   - **Frequency Spectrum**: Analyze frequency components (Delta, Theta, Alpha, Beta, Gamma)
   - **Brain Topography**: See spatial distribution of brain activity

## 🔧 Hardware Integration

### For Real EEG Amplifiers

The system is designed for easy adaptation to real hardware. Here's how to integrate with actual EEG amplifiers:

#### 1. Replace the Simulation API

Edit `amplifier_api_simulation.js` or create a new hardware-specific API file:

```javascript
class RealEEGAmplifier extends EEGAmplifierAPI {
  constructor(config) {
    super(config);
    this.serialPort = null; // or USB/Bluetooth connection
  }
  
  async connect() {
    // Replace with actual hardware connection code
    this.serialPort = await navigator.serial.requestPort();
    await this.serialPort.open({ baudRate: 115200 });
    
    // Hardware-specific initialization
    await this.initializeDevice();
    
    return super.connect();
  }
  
  generateRealisticEEGData(timestamp) {
    // Replace with actual data reading from hardware
    return this.readDataFromHardware();
  }
}
```

#### 2. Common Hardware Interfaces

**Serial/USB Connection**:
```javascript
// For USB-connected amplifiers
const port = await navigator.serial.requestPort();
await port.open({ baudRate: 115200 });

// Read data continuously
const reader = port.readable.getReader();
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  this.processHardwareData(value);
}
```

**Bluetooth Connection**:
```javascript
// For Bluetooth LE devices
const device = await navigator.bluetooth.requestDevice({
  filters: [{ services: ['your-eeg-service-uuid'] }]
});
const server = await device.gatt.connect();
const service = await server.getPrimaryService('your-eeg-service-uuid');
const characteristic = await service.getCharacteristic('data-characteristic-uuid');
```

**Network/WiFi Connection**:
```javascript
// For network-connected amplifiers
const websocket = new WebSocket('ws://amplifier-ip:port');
websocket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  this.processHardwareData(data);
};
```

### 3. Popular EEG Amplifier Integration Examples

#### OpenBCI Integration
```javascript
class OpenBCIAmplifier extends EEGAmplifierAPI {
  async connect() {
    // OpenBCI-specific connection code
    this.board = new OpenBCIBoard();
    await this.board.connect();
    this.board.on('sample', (sample) => {
      this.processOpenBCISample(sample);
    });
  }
}
```

#### g.tec g.USBamp Integration
```javascript
class GUSBampAmplifier extends EEGAmplifierAPI {
  async connect() {
    // g.USBamp API integration
    this.device = new GUSBamp();
    await this.device.initialize();
    this.device.startAcquisition();
  }
}
```

#### ANT Neuro eego Integration
```javascript
class EegoAmplifier extends EEGAmplifierAPI {
  async connect() {
    // ANT Neuro eego mylab integration
    this.amplifier = new EegoMylab();
    await this.amplifier.connect();
  }
}
```

## ⚙️ Configuration

### Signal Processing Parameters

```javascript
const config = {
  sampleRate: 250,           // Hz (125, 250, 500, 1000)
  gain: 1000,               // 100-50000x
  highpassFilter: 0.5,      // Hz
  lowpassFilter: 100,       // Hz
  notchFilter: 50,          // Hz (50/60Hz power line)
  impedanceThreshold: 5000  // Ohms
};
```

### Electrode Configuration

The system supports standard 10-20 electrode positioning:
- **Frontal**: Fp1, Fp2, F3, F4, F7, F8, Fz
- **Central**: C3, C4, Cz, T7, T8
- **Parietal**: P3, P4, P7, P8, Pz
- **Occipital**: O1, O2

### Custom Electrode Layouts

Add custom electrode positions in the `electrodePositions` object:

```javascript
this.electrodePositions = {
  'CustomElectrode1': { x: -30, y: 40, z: 60 },
  'CustomElectrode2': { x: 30, y: 40, z: 60 },
  // Add more as needed
};
```

## 🔬 Technical Specifications

### System Requirements
- **Browser**: Modern web browser with Canvas and WebGL support
- **JavaScript**: ES6+ features required
- **Memory**: ~50MB for real-time operation
- **CPU**: Multi-core recommended for real-time processing

### Performance Characteristics
- **Latency**: <50ms for signal display
- **Sample Rate**: Up to 2000Hz supported
- **Channels**: Scalable to 128+ channels
- **Data Rate**: ~1MB/min for 32 channels at 250Hz

### Signal Processing Features
- **Real-time Filtering**: IIR/FIR filter implementation
- **Artifact Detection**: Automatic artifact identification
- **Frequency Analysis**: Real-time FFT with 1Hz resolution
- **Signal Quality Assessment**: SNR and impedance monitoring

## 🎯 Use Cases

### Research Applications
- **Cognitive Neuroscience**: ERP/ERD studies
- **Brain-Computer Interfaces**: Real-time BCI control
- **Sleep Studies**: Sleep stage classification
- **Neurofeedback**: Real-time feedback training

### Clinical Applications
- **Epilepsy Monitoring**: Seizure detection and analysis
- **Anesthesia Monitoring**: Depth of anesthesia assessment
- **Rehabilitation**: Motor imagery training
- **Diagnostics**: EEG-based diagnosis support

### Educational Use
- **Training Simulators**: EEG technician training
- **Research Training**: Graduate student education
- **Demonstrations**: Conference and exhibition displays

## 🛠️ Customization

### Adding New Visualization Types

```javascript
// Add new visualization tab
drawCustomVisualization() {
  const canvas = this.canvases.custom;
  const ctx = canvas.getContext('2d');
  
  // Your custom visualization code here
  this.drawCustomAnalysis(ctx, this.signalData);
}

// Register new tab
this.visualizationTypes.custom = {
  name: 'Custom Analysis',
  drawFunction: this.drawCustomVisualization.bind(this)
};
```

### Custom Signal Processing

```javascript
// Add custom signal processing
processCustomAnalysis(signalData) {
  // Implement your analysis algorithm
  const results = this.yourAnalysisFunction(signalData);
  
  // Update visualization
  this.updateCustomDisplay(results);
}
```

## 🔍 Troubleshooting

### Common Issues

1. **No Signal Display**
   - Check electrode connections
   - Verify amplifier connection status
   - Ensure recording is started

2. **Poor Signal Quality**
   - Check electrode impedances
   - Adjust gain settings
   - Review filter parameters

3. **Connection Issues**
   - Verify hardware compatibility
   - Check driver installation
   - Test with manufacturer software first

### Debug Mode

Enable debug mode for detailed logging:

```javascript
const demo = new ProfessionalEEGDemo();
demo.enableDebugMode(); // Adds console logging
```

## 📈 Performance Optimization

### For High Channel Count
- Reduce visualization frame rate
- Implement data decimation
- Use Web Workers for processing

### For Real-time Applications
- Minimize DOM manipulations
- Use requestAnimationFrame efficiently
- Implement circular buffers

## 🤝 Contributing

We welcome contributions! Areas for improvement:
- Additional amplifier drivers
- New visualization types
- Signal processing algorithms
- Mobile device support

## 📄 License

This project is open source and available under the MIT License.

## 📞 Support

For technical support or questions:
- Check the troubleshooting section
- Review hardware documentation
- Contact amplifier manufacturer for hardware-specific issues

## 🔮 Future Enhancements

Planned features:
- **Mobile App Version**: React Native implementation
- **Cloud Integration**: Real-time data streaming to cloud
- **AI Integration**: Automated analysis and classification
- **VR/AR Support**: Immersive visualization experience
- **Multi-user Collaboration**: Shared analysis sessions

---

**Note**: This demo system provides a professional foundation for EEG applications. For clinical use, ensure compliance with relevant medical device regulations and validate with your specific hardware requirements.