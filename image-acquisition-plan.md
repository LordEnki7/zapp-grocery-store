# Image Acquisition Plan - Sitephoto Enhancement

## Executive Summary
We need to acquire images for 4 high-priority categories to potentially match 43+ of the remaining 80 generic placeholder products. This represents a 54% improvement opportunity.

## Phase 1: High-Priority Categories (Immediate Impact)

### 1. Personal Care & Beauty (20 products - 25% of remaining)
**Target Products:** Moisturizer, Lotion, Cleanser, Skincare Sets, Face Mask, Serum, Scrub, Toner, Shampoo, Body Wash, Conditioner, Bath Bomb, Soap, Perfume, Deodorant, Lip Balm, Sunscreen, Mouthwash

**Acquisition Strategy:**
- **Generic Product Mockups**: Create simple, clean product mockups for each category
- **Stock Photos**: Source royalty-free images from Unsplash, Pexels, or Pixabay
- **SVG Icons**: Create minimalist SVG representations for each product type
- **Color Scheme**: Use consistent branding colors (blues, whites, clean aesthetics)

**Directory Structure:**
```
sitephoto/
├── Personal Care/
│   ├── moisturizer.svg
│   ├── lotion.svg
│   ├── cleanser.svg
│   ├── skincare-set.svg
│   ├── face-mask.svg
│   ├── serum.svg
│   ├── scrub.svg
│   ├── toner.svg
│   ├── shampoo.svg
│   ├── body-wash.svg
│   ├── conditioner.svg
│   ├── bath-bomb.svg
│   ├── soap.svg
│   ├── perfume.svg
│   ├── deodorant.svg
│   ├── lip-balm.svg
│   ├── sunscreen.svg
│   └── mouthwash.svg
```

### 2. Sauces & Condiments (10 products - 12.5% of remaining)
**Target Products:** BBQ Sauce, Ketchup, Mustard, Hot Sauce, Pizza Sauce, Pesto, Alfredo Sauce, Marinara, Bolognese Sauce, General Sauce

**Acquisition Strategy:**
- **Bottle/Jar Mockups**: Create generic bottle and jar designs
- **Color Coding**: Use colors that represent each sauce type
- **Consistent Labeling**: Simple, clean labels with product type

**Directory Structure:**
```
sitephoto/
├── Sauces/
│   ├── bbq-sauce.svg
│   ├── ketchup.svg
│   ├── mustard.svg
│   ├── hot-sauce.svg
│   ├── pizza-sauce.svg
│   ├── pesto.svg
│   ├── alfredo-sauce.svg
│   ├── marinara.svg
│   ├── bolognese-sauce.svg
│   └── general-sauce.svg
```

### 3. Dips & Spreads (7 products - 8.75% of remaining)
**Target Products:** Hummus, Salsa, Dip, Dressing, Marinade, Tahini, Spread

**Acquisition Strategy:**
- **Container Variety**: Different container types (tubs, bottles, jars)
- **Texture Representation**: Visual cues for different consistencies
- **Fresh Appearance**: Clean, appetizing presentations

**Directory Structure:**
```
sitephoto/
├── Dips & Spreads/
│   ├── hummus.svg
│   ├── salsa.svg
│   ├── dip.svg
│   ├── dressing.svg
│   ├── marinade.svg
│   ├── tahini.svg
│   └── spread.svg
```

### 4. Pickled & Preserved (6 products - 7.5% of remaining)
**Target Products:** Pickles, Olives, Capers, Artichoke Hearts, Roasted Peppers, Relish

**Acquisition Strategy:**
- **Glass Jar Aesthetic**: Consistent jar designs with visible contents
- **Natural Colors**: Represent actual product colors
- **Premium Look**: Clean, gourmet appearance

**Directory Structure:**
```
sitephoto/
├── Pickled & Preserved/
│   ├── pickles.svg
│   ├── olives.svg
│   ├── capers.svg
│   ├── artichoke-hearts.svg
│   ├── roasted-peppers.svg
│   └── relish.svg
```

## Phase 2: Medium-Priority Categories

### 5. Sweet Spreads (5 products)
- Marmalade, Maple Syrup, Preserves, Jam variations

### 6. Baking Supplies (6 products)
- Frosting, Jello, Syrup, Pudding Mix, Pie Filling

### 7. Additional Snacks (15 products)
- Wafers, Biscuits, Trail Mix, Seeds, Jerky, Pasta

## Implementation Strategy

### Option A: SVG Creation (Recommended)
**Pros:**
- Scalable vector format
- Small file sizes
- Easy to customize
- Professional appearance
- Consistent branding

**Tools:**
- Figma (free)
- Adobe Illustrator
- Inkscape (free)
- Canva (templates)

### Option B: Stock Photography
**Pros:**
- Realistic appearance
- Quick acquisition
- Professional quality

**Sources:**
- Unsplash (free)
- Pexels (free)
- Pixabay (free)
- Freepik (free tier)

### Option C: AI-Generated Images
**Pros:**
- Custom creation
- Consistent style
- Unlimited variations

**Tools:**
- DALL-E 2
- Midjourney
- Stable Diffusion
- Adobe Firefly

## Timeline & Resources

### Week 1: Phase 1 Implementation
- **Day 1-2**: Personal Care & Beauty (20 images)
- **Day 3**: Sauces & Condiments (10 images)
- **Day 4**: Dips & Spreads (7 images)
- **Day 5**: Pickled & Preserved (6 images)

### Week 2: Testing & Optimization
- **Day 1**: Organize images in sitephoto directory
- **Day 2**: Run matching script
- **Day 3**: Analyze results and optimize
- **Day 4-5**: Phase 2 implementation if needed

## Success Metrics
- **Target**: Reduce generic placeholders from 80 to 37 (54% improvement)
- **Minimum Acceptable**: Reduce by at least 30 products (37.5% improvement)
- **Stretch Goal**: Reduce by 50+ products (62.5% improvement)

## Budget Considerations
- **SVG Creation**: $0 (using free tools)
- **Stock Photos**: $0-50 (using free sources)
- **AI Generation**: $20-100 (depending on service)
- **Time Investment**: 20-30 hours total

## Next Steps
1. Choose acquisition method (SVG recommended)
2. Create directory structure
3. Begin with Personal Care & Beauty category
4. Test matching after each category completion
5. Iterate and optimize based on results