# 🧘 Stress Relief Component - Customization Guide

## Overview
A new **Stress Relief & Breathing Exercises** component has been created with two main sections:

### 1. **Videos Tab** 📹
- Displays YouTube videos in a beautiful grid
- Click any video to watch it in full screen
- Categories: Breathing, Meditation, Funny, Relaxation
- 6 default videos included

### 2. **Breathing Exercises Tab** 🫁
- Interactive breathing exercises with step-by-step guides
- Built-in timer for practice
- 3 exercises: Box Breathing, 4-7-8 Breathing, Deep Belly Breathing
- Quick tips section

---

## How to Add/Customize Videos

### Location of Videos Array
**File:** `frontend/src/pages/StressRelief.js`

**Lines:** 16-54

### Current Videos Format
```javascript
const VIDEOS = [
  {
    id: 'EzTPScxdUgc',           // YouTube Video ID
    title: '5 Minute Breathing Exercise',
    description: 'Quick breathing exercise to calm anxiety',
    type: 'breathing',             // Type: breathing, meditation, funny, relaxation
    duration: '5 min'
  },
  // ... more videos
];
```

---

## How to Add New Videos

### Step 1: Get YouTube Video ID
- Go to any YouTube video
- Look at the URL: `https://www.youtube.com/watch?v=**ZToKcPoZ1l8**`
- The ID is: `ZToKcPoZ1l8` (the part after `v=`)

### Step 2: Add to VIDEOS Array
Open `StressRelief.js` and add a new video object:

```javascript
{
  id: 'YOUR_VIDEO_ID_HERE',
  title: 'Your Video Title',
  description: 'Brief description of what this video does',
  type: 'breathing',  // Choose: breathing, meditation, funny, relaxation
  duration: '5 min'
}
```

### Example: Add a Yoga Video
```javascript
{
  id: 'noa8dWKNFWI',  // Example yoga video ID
  title: 'Beginner Yoga for Stress Relief',
  description: 'Gentle yoga poses to reduce anxiety and tension',
  type: 'relaxation',
  duration: '20 min'
}
```

---

## Video Type Categories

| Type | Color | Icon | Use For |
|------|-------|------|---------|
| breathing | 🟢 Green | 🫁 | Breathing techniques |
| meditation | 🔵 Blue | 🧘 | Guided meditation |
| funny | 🟠 Orange | 😂 | Funny/entertainment |
| relaxation | 🟣 Purple | 🌸 | Relaxation & stretching |

---

## Recommended Videos to Add

### Breathing Exercises
- `6EzDEkXHmBg` - 4-7-8 Breathing Technique
- `Zq66V3zytMY` - Wim Hof Breathing
- `slQaZVEKxNQ` - Alternate Nostril Breathing

### Meditation
- `jqEZW8rK6Gw` - Calm Meditation for Sleep
- `VKsJkP7InWo` - Morning Meditation
- `21LDGl6Ck4s` - Anxiety Relief Meditation

### Funny/Stress Relief
- `J---aiyznGQ` - Funny Dog Videos
- `EEJrMJ9CvLQ` - Funny Cat Videos
- `0xBBhfXg6PE` - Hilarious Pet Videos

### Yoga/Relaxation
- `noa8dWKNFWI` - Beginner Yoga
- `q0eFGH5KiMc` - Yoga for Anxiety
- `7EvLbVJxWGA` - Restorative Yoga

---

## How to Add Breathing Exercises

**File:** `frontend/src/pages/StressRelief.js`

**Lines:** 56-76

### Current Format
```javascript
const BREATHING_EXERCISES = [
  {
    name: 'Box Breathing',
    steps: [
      'Inhale for 4 counts',
      'Hold for 4 counts',
      'Exhale for 4 counts',
      'Hold for 4 counts',
      'Repeat 5 times'
    ],
    benefits: 'Calms nervous system, reduces anxiety'
  },
  // ... more exercises
];
```

### Example: Add Wim Hof Breathing
```javascript
{
  name: 'Wim Hof Breathing',
  steps: [
    'Take 30-40 deep, rhythmic breaths',
    'After last exhale, hold your breath',
    'Hold for as long as comfortable',
    'Take 1 deep breath and hold for 15 seconds',
    'Repeat 3-4 times'
  ],
  benefits: 'Increases oxygen, boosts immune system, reduces stress'
}
```

---

## Component Features

✅ **YouTube Integration** - Embedded videos load directly
✅ **Responsive Design** - Works on mobile, tablet, desktop
✅ **Timer** - Built-in timer for breathing exercises
✅ **Categories** - Color-coded by type
✅ **Search-friendly** - Organized grid layout
✅ **Mobile Optimized** - Touch-friendly buttons
✅ **Quick Tips** - 4 quick stress relief tips at bottom

---

## File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── StressRelief.js         (Main component)
│   │   └── StressRelief.css        (Styling)
│   ├── components/
│   │   └── Layout/
│   │       └── Layout.js           (Updated with nav link)
│   ├── App.js                      (Updated with route)
│   └── Dashboard.js                (Updated button link)
```

---

## Routes

- Dashboard → Stress Relief button → `/stress-relief`
- Sidebar → Stress Relief link → `/stress-relief`
- Accessible from: Dashboard, Navigation menu

---

## Testing

1. **Local Testing:**
   ```bash
   npm start  # in frontend directory
   ```
   
2. **Check Console:**
   - Videos should load thumbnails from YouTube
   - Timer should count correctly
   - All buttons should be functional

3. **Mobile Testing:**
   - Use DevTools → Responsive Design Mode
   - Test on phone-sized screens

---

## Quick Customization Checklist

- [ ] Add your YouTube videos to the `VIDEOS` array
- [ ] Update video types (breathing, meditation, funny, relaxation)
- [ ] Add more breathing exercises if desired
- [ ] Test all videos load correctly
- [ ] Verify timer works
- [ ] Check mobile responsiveness
- [ ] Deploy to Vercel

---

## Notes

- YouTube videos must be **public** to embed
- Video IDs are case-sensitive
- Thumbnails are auto-generated by YouTube
- Timer data is not saved (local only)
- Works in all modern browsers

---

Ready to customize! Provide the YouTube video links and I'll add them for you. 🎬
