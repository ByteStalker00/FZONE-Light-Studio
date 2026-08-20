# FZONE Light Studio

Desktop application for intelligent aquarium lighting control. Generates custom light profiles with smooth linear fades, PWM flicker protection, and astronomical calculations based on geographic position.

## 📋 Key Features

- **6 predefined light profiles** optimized for specific purposes
- **Linear fading** between profiles with smooth transitions
- **PWM protection** against flicker in the 1-3% range
- **Astronomical sunrise/sunset** calculations based on latitude/longitude
- **Intuitive interface** with time-slot visualization and timeline graph
- **QR code** for quick hardware configuration
- **Import/Export** configurations via hexadecimal code

## 🌅 Light Profiles

### 1. `sunMoon` - "Sun & Moon"
**Purpose**: Simulates the natural day-night cycle for home aquariums.
- **Sunrise**: Gradual from dark to full light (22-92% intensity)
- **Day**: Full light with balanced spectrum (W:92, R:48, G:20, B:62)
- **Sunset**: Gradual dimming toward twilight
- **Night**: Residual blue 04% for circadian rhythm
- **Plants**: Suitable for mixed green and red plants
- **Time slots**: 05:16 (sunrise) → 21:12 (sunset)

### 2. `moonBlue` - "Blue Moon"
**Purpose**: Minimal blue night light, ideal to avoid disturbing fish and plants.
- **Channel**: Only Blue active in all time slots
- **Intensity**: Progressive 10% → 30% → 60% (max at night) → 40% → 20% → 5%
- **Other channels**: Red, Green, White always off
- **Observation**: Watch inhabitants at night without stressing them
- **Time slots**: Moon active all night long

### 3. `growth` - "Plant Growth"
**Purpose**: Maximum aquatic plant growth, intensive Red for photosynthesis.
- **Red**: High 30%→75% at noon (peak red chlorophyll)
- **Green**: Moderate 15%→35% (full spectrum without waste)
- **Blue**: Low 10%→25% (regulates circadian rhythm)
- **White**: 0%→80%→100% (supplementary light)
- **Optimized**: For intense red plants and rapid growth
- **Time slots**: 05:16 (sunrise) → 21:12 (sunset)

### 4. `dayNight` - "Day/Night"
**Purpose**: Balanced day/night cycle for a general aquarium.
- **Balanced**: All channels (W/R/G/B) rise together
- **Day**: Full warm white light (W:100, R:55, G:52, B:52)
- **Night**: All channels off
- **Best for**: Community aquarium, basic fish+plants
- **Time slots**: 05:16 (sunrise) → 21:12 (sunset)

### 5. `fullLight` - "Full Light"
**Purpose**: Maximum light output for fast and demanding growth.
- **Day**: All channels at 100% (W:100, R:100, G:100, B:100)
- **Morning ramp**: Start at 70% and rise to 100% at sunrise
- **Evening**: Reduced to 60% before dropping to 0 at night
- **Purpose**: Demanding plants, corals, accelerated growth
- **Time slots**: 05:16 (sunrise) → 21:12 (sunset)

### 6. `moonOnly` - "Moon Only"
**Purpose**: Minimal night light, moon observation only.
- **Single channel**: Constant Blue 04% across all 6 time slots
- **Other channels**: White, Red, Green always off
- **Night observation**: Visibility without turning on the whole aquarium
- **Time slots**: Fixed blue all night (00:00 → 20:00 → 00:00)

## ⚙️ How to Use

### Installation
1. Run `FZONE Light Studio.exe` from the `bin/` folder
2. The app starts at `http://127.0.0.1:8701/`
3. No additional installations required

### Setting Your Location
1. Click the **📍 Location** button (left side)
2. Enable geolocation or enter manually:
   - **Latitude**: e.g. `45.0` (north-central Italy)
   - **Longitude**: e.g. `9.0` (eastern Italy)
   - **Date**: Current date or a specific one
3. Click **Apply sunrise/sunset** to calculate the times

### Selecting a Profile
1. Click one of the profile icons at the bottom:
   - `Sun & Moon` - Sun and Moon
   - `Blue Moon` - Blue Moon
   - `Plant Growth` - Plant Growth
   - `Day/Night` - Day/Night
   - `Full Light` - Full Light
   - `Moon Only` - Moon Only
2. The W/R/G/B values load immediately into the tables
3. A linear fade (20 seconds) starts toward the new values

### Manual Adjustment
- Modify the percentage values in the time-slot tables
- Use the `time` inputs to set exact hours/minutes
- Click **Generate** (Gen) to re-encode the QR config
- Use **Import** to load previous configurations

### Fade
- **20 seconds** per profile change
- **35 seconds** for natural sunrise/sunset transitions
- Automatic protection: PWM values 1-3% become 0 or 4%
- Visible in the timeline graph area

### QR Code & Config
- Click **Generate QR** to create the hardware configuration code
- Click **Copy Hex** to copy the hexadecimal code
- Use **Import Hex** to load saved configurations
- The format starts with `smartaqua_brite` followed by 68 hexadecimal characters

## 📊 Technical Specifications

### Astronomical Calculations
- Uses lat/lon positions for accurate sunrise/sunset
- Latitude: `45.0` ≈ San Benedetto del Tronto (43°N)
- Longitude: `9.0` ≈ central Italy
- Light duration: ~15-16 hours (mid-August)

### Hardware Output
- Format: `smartaqua_brite` + CRC validation bytes
- 6 time slots × (Hour, Minute, W, R, G, B)
- CRC check bytes for integrity validation
- Compatible with SmartAqua Brite drivers

### PWM Protection
- Values in the 1-3% range are corrected automatically
- 0% = off, 4%+ = safe minimum value
- Prevents visible flicker on LED drivers

### Interface
- **Timeline**: Horizontal graph with W/R/G/B channels
- **Time slots**: 6-hour tables with editable values
- **QR Code**: Quick hardware configuration
- **Log**: Debugging and real-time events

## 🎯 For Italians (San Benedetto del Tronto)

The app is pre-configured for:
- **Latitude**: ~45.0 (corresponding to ~43°N SBT)
- **Longitude**: ~9.0 (eastern Italy)
- **Sunrise time**: Around 05:16 (mid-August)
- **Sunset time**: Around 21:12 (mid-August)
- **Day length**: ~15-16 hours

Adjust values based on your aquarium inhabitants:
- **Red plants**: Increase the Red channel in the `growth`/`sunMoon` profiles
- **Green plants**: The Green channel complements them in the same profiles
- **Fish only**: Use `moonOnly` or `moonBlue` at night
- **General aquarium**: `dayNight` offers optimal balance

## 🛠️ Technical Development

### File Structure
- `assets/js/main.js` - Core logic, fade, validation
- `assets/js/presets.js` - 6 optimized light profiles
- `assets/js/i18n.js` - 20-language support
- `assets/css/style.css` - Styling and page zoom
- `build/build.bat` - Windows EXE compilation

### Recent Updates
- **Linear fade**: Smooth transition between profiles (20s)
- **PWM protection**: Prevents flicker in the 1-3% range
- **Optimized profiles**: Values consistent with each profile's name
- **Sunrise/sunset fade**: 35 seconds for natural realism

### Build & Distribution
```bash
# Recompile EXE
cmd /c build\build.bat

# Result: bin\FZONE Light Studio.exe (single file)
```

## 📝 Important Notes

1. **Localization**: Sunrise/sunset times are based on the entered coordinates
2. **Fade**: Transitions are visible but not disruptive
3. **PWM**: The 1-3% protection is automatic and irreversible for stability
4. **Profiles**: Each name matches its intent (moonBlue = blue, growth = red, etc.)
5. **Backup**: Use Import/Export Hex code to save configurations

## 📧 Support

For issues or suggestions:
- Check the browser console (F12) for errors
- Geolocation requires browser permission
- PWM values 1-3% are automatically protected

---
*FZONE Light Studio - Aquarium Lighting Control*
