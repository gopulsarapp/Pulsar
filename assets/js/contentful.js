/*
=====================================================
  CONTENTFUL.JS
  This file fetches all content from Contentful
  and injects it into the page.
=====================================================
*/

// (function () { // Uncomment this line to wrap the code in a private scope
  "use strict";

  // --- 1. CONFIGURATION ---
  // Replace with your own Contentful Space ID and Access Token
  const CONTENTFUL_SPACE_ID = 'mc1xdogpqbyd';
  const CONTENTFUL_ACCESS_TOKEN = 'CZjD6ZuG0hsFUL_vG2PwD_udCAy2HgQFOp9Y_Y_241E';

  // Check for configuration errors
  if (CONTENTFUL_SPACE_ID === 'YOUR_SPACE_ID' || CONTENTFUL_ACCESS_TOKEN === 'YOUR_CONTENT_DELIVERY_API_TOKEN') {
    console.error("Contentful credentials are not set. Please update assets/js/contentful.js");
  }

  // --- 2. INITIALIZE CONTENTFUL CLIENT ---
  const client = contentful.createClient({
    space: CONTENTFUL_SPACE_ID,
    accessToken: CONTENTFUL_ACCESS_TOKEN,
  });

  // --- 3. HELPER FUNCTIONS ---
  
  /**
   * Safely gets a file URL from a Contentful media asset.
   * @param {object} mediaField - The Contentful media field.
   * @returns {string} - The URL or an empty string.
   */
  const getImageUrl = (mediaField) => {
    if (mediaField && mediaField.fields && mediaField.fields.file && mediaField.fields.file.url) {
      return mediaField.fields.file.url;
    }
    return '';
  };
  
  // --- 4. FETCH & RENDER FUNCTIONS ---

  /**
   * Fetches the Global Config (logo, nav, title).
   */
  async function fetchGlobalConfig() {
    try {
      const entries = await client.getEntries({
        content_type: 'globalSiteConfig',
        limit: 1, // We only ever want one config entry
        include: 2  // Include 2 levels deep to get the linked nav items
      });

      if (!entries.items || entries.items.length === 0) {
        console.error("No 'globalConfig' entry found in Contentful.");
        return;
      }

      const config = entries.items[0].fields;

      // 4.1. Set Page Title & Favicon
      if (config.siteTitle) {
        document.title = config.siteTitle;
      }
      const favicon = document.getElementById('favicon');
      if (favicon && config.favicon) {
        favicon.href = getImageUrl(config.favicon);
      }

      // 4.2. Set Logos
      const logoLight = document.getElementById('logo-light');
      if (logoLight && config.logoLight) {
        logoLight.src = getImageUrl(config.logoLight);
      }
      const logoDark = document.getElementById('logo-dark');
      if (logoDark && config.logoDark) {
        logoDark.src = getImageUrl(config.logoDark);
      }

      // 4.3. Build Main Navigation
      const navUl = document.getElementById('main-nav-ul');
      if (navUl && config.mainNavigation) {
        navUl.innerHTML = ''; // Clear static content
        config.mainNavigation.forEach(navLink => {
          if (navLink && navLink.fields) {
            const fields = navLink.fields;
            const li = document.createElement('li');
            li.className = 'nav__item';
            
            const a = document.createElement('a');
            a.href = fields.url || '#';
            a.className = 'nav__item-link';
            if (fields.isActive) {
              a.classList.add('active');
            }
            a.textContent = fields.text || '';
            
            li.appendChild(a);
            navUl.appendChild(li);
          }
        });
      }

    } catch (error) {
      console.error("Error fetching global config:", error);
    }
  }

  /**
   * Fetches the Hero Slider section.
   */
  async function fetchHeroSlider() {
    try {
      const entries = await client.getEntries({
        content_type: 'pageSectionHero',
        limit: 1, // Only one Hero section
        include: 2 // Get the linked 'heroSlide' entries
      });

      if (!entries.items || entries.items.length === 0) {
        console.error("No 'pageSectionHero' entry found in Contentful.");
        return;
      }

      const heroSection = entries.items[0].fields;
      const sliderContainer = document.getElementById('hero-slider-container');

      if (!sliderContainer || !heroSection.slides) {
        return;
      }

      sliderContainer.innerHTML = ''; // Clear static slides

      heroSection.slides.forEach(slide => {
        if (slide && slide.fields) {
          const fields = slide.fields;
          const imageUrl = getImageUrl(fields.backgroundImage);

          // Create the slide element based on the *exact* HTML structure
          const slideDiv = document.createElement('div');
          slideDiv.className = 'slide-item align-v-h';
          
          slideDiv.innerHTML = `
            <div class="bg-img" style="background-image: url('${imageUrl}');"></div>
            <div class="container">
              <div class="row align-items-center">
                <div class="col-sm-12 col-md-12 col-lg-12 col-xl-7">
                  <div class="slide__content">
                    <span class="slide__subtitle">${fields.subtitle || ''}</span>
                    <h2 class="slide__title">${fields.title || ''}</h2>
                    <p class="slide__desc">${fields.description || ''}</p>
                    <div class="d-flex flex-wrap align-items-center">
                      <a href="${fields.buttonUrl || '#'}" class="btn btn__secondary btn__rounded mr-30">
                        <span>${fields.buttonText || 'Learn More'}</span>
                        <i class="icon-arrow-right"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
          sliderContainer.appendChild(slideDiv);
        }
      });

    } catch (error) {
      console.error("Error fetching hero slider:", error);
    }
  }

  /**
   * Fetches the Features Carousel section.
   * NOTE: This version omits the icon as requested.
   */
  async function fetchFeaturesCarousel() {
    try {
      const entries = await client.getEntries({
        content_type: 'pageSectionFeatures',
        limit: 1,
        include: 2 // Get the linked 'featureItem' entries
      });

      if (!entries.items || entries.items.length === 0) {
        console.error("No 'pageSectionFeatures' entry found in Contentful.");
        return;
      }

      const featuresSection = entries.items[0].fields;
      const carouselContainer = document.getElementById('features-carousel-container');
      
      if (!carouselContainer || !featuresSection.features) {
        return;
      }

      carouselContainer.innerHTML = ''; // Clear static features

      featuresSection.features.forEach(item => {
        if (item && item.fields) {
          const fields = item.fields;
          
          // Create the feature element.
          // The 'feature__icon' div is intentionally left out, as requested.
          const featureDiv = document.createElement('div');
          featureDiv.className = 'feature-item d-flex';
          
          featureDiv.innerHTML = `
            <div class="feature__content">
              <h4 class="feature__title">${fields.title || ''}</h4>
              <p class="feature__desc">${fields.description || ''}</p>
              <a href="${fields.linkUrl || '#'}" class="btn btn__link btn__secondary">
                <span>${fields.linkText || 'Read More'}</span>
                <i class="icon-arrow-right"></i>
              </a>
            </div>
          `;
          carouselContainer.appendChild(featureDiv);
        }
      });

    } catch (error) {
      console.error("Error fetching features carousel:", error);
    }
  }

  /**
   * Fetches the About (with Image) section ('About Layout 4' in HTML).
   */
  async function fetchAboutImageSection() {
    try {
      const entries = await client.getEntries({
        content_type: 'pageSectionAboutImage', // Make sure this API ID matches your Contentful model
        limit: 1
      });

      if (!entries.items || entries.items.length === 0) {
        console.warn("No 'pageSectionAboutImage' entry found in Contentful.");
        // Optional: Hide the section if no content is found
        const sectionElement = document.getElementById('about-layout4-section');
        if (sectionElement) sectionElement.style.display = 'none';
        return;
      }

      const fields = entries.items[0].fields;

      // Update Text Content
      const heading = document.getElementById('about-heading');
      if (heading) heading.textContent = fields.heading || '';

      const p1 = document.getElementById('about-p1');
      if (p1) p1.textContent = fields.paragraph1 || '';

      const p2 = document.getElementById('about-p2');
      if (p2) p2.textContent = fields.paragraph2 || '';

      // --- IMAGE HANDLING ---
      const imageContainer = document.getElementById('about-image-container'); // Target the container div
      const imageElement = document.getElementById('about-image'); // Target the img tag
      
      if (imageContainer && imageElement && fields.image) {
        const imageUrl = getImageUrl(fields.image); // Use helper function
        if (imageUrl) {
            imageElement.src = imageUrl;
            // Set alt text from image description or fallback to heading
            imageElement.alt = fields.image.fields?.description || fields.heading || 'About section image';
            imageElement.style.borderRadius = '15px';
            imageContainer.style.display = ''; // Ensure container is visible
        } else {
            // Hide the image and container if image URL is invalid
            console.warn("Image found in Contentful but URL is missing.");
            imageContainer.style.display = 'none';
        }
      } else if (imageContainer) {
         // Hide container if no image field in Contentful or elements not found in HTML
         imageContainer.style.display = 'none';
      }
      // --- END IMAGE HANDLING ---

    } catch (error) {
      console.error("Error fetching about image section:", error);
    }
  }

  async function fetchFeaturesLayout1Section() {
    try {
      const entries = await client.getEntries({
        content_type: 'pageSectionFeaturesLayout1', // API ID of the section model
        limit: 1,
        include: 2 // Include linked feature items
      });

      if (!entries.items || entries.items.length === 0) {
        console.warn("No 'pageSectionFeaturesLayout1' entry found in Contentful.");
        // Optional: Hide section
        // const sectionElement = document.getElementById('features-layout1-section');
        // if (sectionElement) sectionElement.style.display = 'none';
        return;
      }

      const fields = entries.items[0].fields;

      // Set Background Image (Targeting the parent section)
      const sectionElement = document.getElementById('features-layout1-section');
      if (sectionElement && fields.backgroundImage) {
        const bgImageUrl = getImageUrl(fields.backgroundImage);
        if (bgImageUrl) {
          // The template uses a nested div for the bg-img, apply style to parent
          sectionElement.style.backgroundImage = `url(${bgImageUrl})`;
          // Add classes needed by the template's CSS for positioning/overlay
          sectionElement.classList.add('bg-img'); 
        }
      }

      // Update Heading
      const heading = document.getElementById('features-l1-heading');
      if (heading) heading.textContent = fields.mainHeading || '';

      // Update Description
      const description = document.getElementById('features-l1-desc');
      if (description) description.textContent = fields.description || '';

      // Update Button
      const button = document.getElementById('features-l1-button');
      if (button) {
        const buttonSpan = button.querySelector('span');
        if (buttonSpan) buttonSpan.textContent = fields.buttonText || 'Learn More';
        button.href = fields.buttonUrl || '#';
      }

      // Update Footer Text and Link
      const footerTextElement = document.getElementById('features-l1-footer-text');
      if (footerTextElement) {
          // Clear existing content first
          footerTextElement.innerHTML = ''; 
          // Add the main text
          footerTextElement.appendChild(document.createTextNode(fields.footerText || '')); 
          
          // Add the link if text and URL exist
          if (fields.footerLinkText && fields.footerLinkUrl) {
              footerTextElement.appendChild(document.createTextNode(' ')); // Add space before link
              const footerLink = document.createElement('a');
              footerLink.href = fields.footerLinkUrl;
              footerLink.className = 'color-secondary'; // Match template style
              footerLink.innerHTML = `
                  <span>${fields.footerLinkText}</span> <i class="icon-arrow-right"></i>
              `;
              footerTextElement.appendChild(footerLink);
          }
      }

      // Generate Feature Items
      const itemsContainer = document.getElementById('features-l1-items-container');
      if (itemsContainer && fields.featureItems) {
        itemsContainer.innerHTML = ''; // Clear static items
        fields.featureItems.forEach(item => {
          if (item && item.fields) {
            const itemFields = item.fields;
            const colDiv = document.createElement('div');
            colDiv.className = 'col-sm-6 col-md-6 col-lg-3'; // Use template's column classes
            
            const iconUrl = itemFields.icon ? getImageUrl(itemFields.icon) : '';
            const iconAlt = itemFields.icon?.fields?.description || itemFields.title || 'Feature icon'; // Alt text
            const iconSize = '50px'; // Define desired icon size (adjust as needed)

            // Recreate the HTML structure using an <img> tag for the SVG
            colDiv.innerHTML = `
              <div class="feature-item">
                <div class="feature__content">
                  <div class="feature__icon">
                    ${iconUrl ? 
                      `<img 
                         src="${iconUrl}" 
                         alt="${iconAlt}" 
                         style="width: ${iconSize}; height: ${iconSize}; object-fit: contain;"
                       >` : 
                      '<span style="display: inline-block; width: 50px; height: 50px;"></span>' // Placeholder if no icon
                    }

                    </div>
                  <h4 class="feature__title">${itemFields.title || ''}</h4>
                </div><a href="${itemFields.linkUrl || '#'}" class="btn__link">
                  <i class="icon-arrow-right icon-outlined"></i> </a>
              </div>`;
            itemsContainer.appendChild(colDiv);
          }
        });
      }

    } catch (error) {
      console.error("Error fetching Features Layout 1 section:", error);
    }
  }


  async function fetchWorkProcessSection() {
    try {
      const entries = await client.getEntries({
        content_type: 'pageSectionWorkProcess',
        limit: 1,
        include: 2 // Include linked process items
      });

      if (!entries.items || entries.items.length === 0) {
        console.warn("No 'pageSectionWorkProcess' entry found in Contentful.");
        // Optional: Hide section
        // const sectionElement = document.getElementById('work-process-section');
        // if (sectionElement) sectionElement.style.display = 'none';
        return;
      }

      const fields = entries.items[0].fields;

      // Set Background Image (Targeting the parent section)
      const sectionElement = document.getElementById('work-process-section');
      if (sectionElement && fields.backgroundImage) {
        const bgImageUrl = getImageUrl(fields.backgroundImage);
        if (bgImageUrl) {
          // Apply directly to the section tag which has the bg-img class in the original HTML
          sectionElement.style.backgroundImage = `url(${bgImageUrl})`;
        }
      }

      // Update Heading Area
      const subtitle = document.getElementById('work-process-subtitle');
      if (subtitle) subtitle.textContent = fields.subtitle || '';

      const title = document.getElementById('work-process-title');
      if (title) title.textContent = fields.title || '';

      const description = document.getElementById('work-process-desc');
      if (description) description.textContent = fields.description || '';

      // Update List Items
      const listUl = document.getElementById('work-process-list');
      if (listUl && fields.listItems && fields.listItems.length > 0) {
        listUl.innerHTML = ''; // Clear static list
        fields.listItems.forEach(itemText => {
          const li = document.createElement('li');
          li.textContent = itemText;
          listUl.appendChild(li);
        });
      } else if (listUl) {
         listUl.innerHTML = ''; // Clear if no items
      }

      // Generate Process Steps Carousel Items
      const stepsContainer = document.getElementById('work-process-steps-container');
      if (stepsContainer && fields.processSteps) {
        stepsContainer.innerHTML = ''; // Clear static items
        fields.processSteps.forEach(item => {
          if (item && item.fields) {
            const itemFields = item.fields;
            const stepDiv = document.createElement('div'); // Slick needs direct children
            // Recreate the exact HTML structure for a process item
            const iconUrl = itemFields.icon ? getImageUrl(itemFields.icon) : '';
          const iconAlt = itemFields.icon?.fields?.description || itemFields.title || 'Process step icon';
          const iconSize = '55px'; // Match original CSS icon size - adjust if needed

          // Recreate the HTML structure using an <img> tag for the SVG
          stepDiv.innerHTML = `
            <div class="process-item">
              <span class="process__number">${itemFields.stepNumber || ''}</span>
              <div class="process__icon">
                ${iconUrl ? 
                  `<img 
                     src="${iconUrl}" 
                     alt="${iconAlt}" 
                     style="width: ${iconSize}; height: ${iconSize}; object-fit: contain;"
                   >` : 
                  '<span style="display: inline-block; width: 55px; height: 55px;"></span>' // Placeholder
                }
              </div><h4 class="process__title pt-20">${itemFields.title || ''}</h4>
              <p class="process__desc">${itemFields.description || ''}</p>
              <a href="${itemFields.linkUrl || '#'}" class="btn btn__secondary btn__link">
                <span>${itemFields.linkText || 'Learn More'}</span>
                <i class="icon-arrow-right"></i> </a>
            </div>`;
          stepsContainer.appendChild(stepDiv);
          }
        });
      }

      // Update CTA Banner
      const ctaImage = document.getElementById('work-process-cta-image');
      if (ctaImage && fields.ctaImage) {
          const ctaImageUrl = getImageUrl(fields.ctaImage);
          ctaImage.src = ctaImageUrl || '';
          ctaImage.alt = fields.ctaImage.fields?.description || 'CTA Icon';
      } else if (ctaImage) {
          ctaImage.src = ''; // Clear if no image
          ctaImage.alt = '';
      }

      const ctaTitle = document.getElementById('work-process-cta-title');
      if (ctaTitle) ctaTitle.textContent = fields.ctaTitle || '';

      const ctaDesc = document.getElementById('work-process-cta-desc');
      if (ctaDesc) ctaDesc.textContent = fields.ctaDescription || '';

      const ctaButton = document.getElementById('work-process-cta-button');
      if (ctaButton) {
        const ctaButtonSpan = ctaButton.querySelector('span');
        if (ctaButtonSpan) ctaButtonSpan.textContent = fields.ctaButtonText || 'Learn More';
        ctaButton.href = fields.ctaButtonUrl || '#';
      }

    } catch (error) {
      console.error("Error fetching Work Process section:", error);
    }
  }


  async function fetchContactSection() {
    try {
      const entries = await client.getEntries({
        content_type: 'pageSectionContact',
        limit: 1,
        include: 1 // Only need 1 level deep for this section
      });

      if (!entries.items || entries.items.length === 0) {
        console.warn("No 'pageSectionContact' entry found in Contentful.");
        // Optional: Hide section
        // const sectionElement = document.getElementById('contact-layout5-section');
        // if (sectionElement) sectionElement.style.display = 'none';
        return;
      }

      const fields = entries.items[0].fields;

      // Set Background Image
      const sectionElement = document.getElementById('contact-layout5-section');
      if (sectionElement && fields.backgroundImage) {
        const bgImageUrl = getImageUrl(fields.backgroundImage);
        if (bgImageUrl) {
          // The template uses a nested div, but also applies styles directly. Let's try direct.
          sectionElement.style.backgroundImage = `url(${bgImageUrl})`;
          sectionElement.style.backgroundRepeat = 'no-repeat'; // Add this line
            sectionElement.style.backgroundSize = 'cover';     // Add this line
            sectionElement.style.backgroundPosition = 'center center';
          // Ensure the overlay class remains if needed
          sectionElement.classList.add('bg-overlay', 'bg-overlay-blue-gradient'); 
        }
      }

      // Update Heading Area (Left Side)
      const heading = document.getElementById('contact-l5-heading');
      if (heading) heading.textContent = fields.heading || '';

      const description = document.getElementById('contact-l5-desc');
      if (description) description.textContent = fields.description || '';

      // Update List Items (Left Side)
      const listUl = document.getElementById('contact-l5-list');
      if (listUl && fields.listItems && fields.listItems.length > 0) {
        listUl.innerHTML = ''; // Clear static list
        fields.listItems.forEach(itemText => {
          const li = document.createElement('li');
          li.textContent = itemText;
          listUl.appendChild(li);
        });
      } else if (listUl) {
         listUl.innerHTML = ''; // Clear if no items
      }

      // Update Contact Form Text (Right Side)
      const formTitle = document.getElementById('contact-l5-form-title');
      if (formTitle) formTitle.textContent = fields.formTitle || '';

      const formDesc = document.getElementById('contact-l5-form-desc');
      if (formDesc) formDesc.textContent = fields.formDescription || '';

      const formButton = document.getElementById('contact-l5-form-button');
      if (formButton) {
          const buttonSpan = formButton.querySelector('span');
          if (buttonSpan) buttonSpan.textContent = fields.formSubmitButtonText || 'Submit Request';
          // Keep the arrow icon
      }

    } catch (error) {
      console.error("Error fetching Contact Layout 5 section:", error);
    }
  }


  async function fetchTestimonialsSection() {
    try {
      const entries = await client.getEntries({
        content_type: 'pageSectionTestimonials', // API ID for the section
        limit: 1,
        include: 2 // Include linked testimonial entries
      });

      if (!entries.items || entries.items.length === 0) {
        console.warn("No 'pageSectionTestimonials' entry found in Contentful.");
        // Optional: Hide section
        // const sectionElement = document.getElementById('testimonials-layout2-section');
        // if (sectionElement) sectionElement.style.display = 'none';
        return;
      }

      const fields = entries.items[0].fields;

      // Update Title (Assuming subtitle might not be in your specific HTML)
      const title = document.getElementById('testimonials-l2-title');
      if (title) title.textContent = fields.title || 'Inspiring Stories!'; // Use Contentful title or fallback

      // Get containers for both sliders
      const quoteSliderContainer = document.getElementById('testimonials-l2-quote-slider');
      const navSliderContainer = document.getElementById('testimonials-l2-nav-slider');

      if (!quoteSliderContainer || !navSliderContainer || !fields.testimonials) {
          console.error("Testimonial slider containers or testimonial entries not found.");
          if(quoteSliderContainer) quoteSliderContainer.innerHTML = ''; // Clear if exists but no content
          if(navSliderContainer) navSliderContainer.innerHTML = ''; // Clear if exists but no content
          return;
      }

      // Clear static content
      quoteSliderContainer.innerHTML = '';
      navSliderContainer.innerHTML = '';

      // Generate Testimonial Slides for BOTH sliders
      fields.testimonials.forEach(item => {
        if (item && item.fields) {
          const itemFields = item.fields;
          const avatarUrl = itemFields.authorAvatar ? getImageUrl(itemFields.authorAvatar) : 'assets/images/testimonials/thumbs/1.png'; // Fallback image
          const avatarAlt = itemFields.authorAvatar?.fields?.description || itemFields.authorName || 'Client avatar';
          
          // --- Create Quote Slide ---
          const quoteSlideDiv = document.createElement('div');
          // The parent div for Slick needs no extra classes here based on original HTML
          quoteSlideDiv.innerHTML = `
            <div class="testimonial-item">
              <h3 class="testimonial__title">${itemFields.quote || ''}</h3>
            </div>`;
          quoteSliderContainer.appendChild(quoteSlideDiv);

          // --- Create Navigation Slide ---
          const navSlideDiv = document.createElement('div');
              // The parent div for Slick needs no extra classes here
              navSlideDiv.innerHTML = `
                <div class="testimonial__meta">
                  <div class="testimonial__thmb">
                    <img 
                      src="${avatarUrl}" 
                      alt="${avatarAlt}" 
                      style="width: 53px; height: 53px; object-fit: cover; border-radius: 50%; display: block; margin: auto;" 
                      /> 
                  </div><div>
                    <h4 class="testimonial__meta-title">${itemFields.authorName || ''}</h4>
                    <p class="testimonial__meta-desc">${itemFields.authorTitle || ''}</p>
                  </div>
                </div>`;
              navSliderContainer.appendChild(navSlideDiv);
        }
      });

    } catch (error) {
      console.error("Error fetching Testimonials Layout 2 section:", error);
    }
  }

  async function fetchGallerySection() {
    try {
      const entries = await client.getEntries({
        content_type: 'pageSectionGallery',
        limit: 1,
        include: 2 // Include linked galleryImage entries
      });

      if (!entries.items || entries.items.length === 0) {
        console.warn("No 'pageSectionGallery' entry found in Contentful.");
        // Optional: Hide section
        // const sectionElement = document.getElementById('gallery-section');
        // if (sectionElement) sectionElement.style.display = 'none';
        return;
      }

      const fields = entries.items[0].fields;
      const galleryContainer = document.getElementById('gallery-carousel-container');

      if (!galleryContainer || !fields.images) {
        console.error("Gallery container or images not found.");
         if(galleryContainer) galleryContainer.innerHTML = ''; // Clear if container exists but no images
        return;
      }

      galleryContainer.innerHTML = ''; // Clear static items

      // Generate Gallery Items
      fields.images.forEach(item => {
        if (item && item.fields && item.fields.imageFile) {
          const itemFields = item.fields;
          const imageUrl = getImageUrl(itemFields.imageFile);
          const altText = itemFields.altText || itemFields.imageFile.fields?.description || 'Gallery image';
          
          if (imageUrl) {
            // Recreate the exact 'a' tag structure for Slick and Magnific Popup
            const linkElement = document.createElement('a');
            linkElement.className = 'popup-gallery-item'; // Class needed for Magnific Popup
            linkElement.href = imageUrl; // Link to the full image for popup
            
            linkElement.innerHTML = `
              <img src="${imageUrl}" alt="${altText}">
            `;
            galleryContainer.appendChild(linkElement);
          }
        }
      });

    } catch (error) {
      console.error("Error fetching Gallery section:", error);
    }
  }

  // --- 5. INITIALIZATION ---
  
  /**
   * Main function to fetch all content when the page loads.
   * We use DOMContentLoaded to ensure the HTML elements are ready to be targeted.
   * This script should run *before* main.js so content is in place
   * before Slick carousels are initialized.
   */
  document.addEventListener('DOMContentLoaded', () => {
    // Show a loading state if you want
    // document.body.style.opacity = 0.5; 

    // Fetch all content
    Promise.all([
      fetchGlobalConfig(),
    fetchHeroSlider(),
    fetchFeaturesCarousel(),
    fetchAboutImageSection(),
    fetchFeaturesLayout1Section(),
    fetchWorkProcessSection(),
    fetchContactSection(),
    fetchTestimonialsSection(),
    fetchGallerySection()
      // Add more fetch functions here for other sections
    ]).then(() => {
        console.log("All Contentful content loaded successfully.");

    // --- CAROUSEL FIX START ---
    // We need to explicitly re-initialize Slick carousels AFTER
    // the dynamic content has been injected into the DOM.

    // 1. Re-initialize Hero Slider
    const $heroSlider = $('#hero-slider-container');
    if ($heroSlider.length > 0 && typeof $heroSlider.slick === 'function') {
      const heroOptions = $heroSlider.data('slick'); // Get options from data attribute
      // Destroy if already initialized (likely failed initialization from main.js)
      if ($heroSlider.hasClass('slick-initialized')) {
        $heroSlider.slick('unslick');
      }
      // Initialize with fetched content
      $heroSlider.slick(heroOptions);
      console.log("Hero slider re-initialized.");
    } else {
      console.log("Hero slider element not found or Slick not loaded for it.");
    }

    // 2. Re-initialize Features Carousel
    const $featuresSlider = $('#features-carousel-container');
    if ($featuresSlider.length > 0 && typeof $featuresSlider.slick === 'function') {
      const featureOptions = $featuresSlider.data('slick'); // Get options from data attribute
       // Destroy if already initialized
      if ($featuresSlider.hasClass('slick-initialized')) {
        $featuresSlider.slick('unslick');
      }
       // Initialize with fetched content
      $featuresSlider.slick(featureOptions);
      console.log("Features carousel re-initialized."); // <-- Check browser console for this message
    } else {
       console.log("Features carousel element not found or Slick not loaded for it."); // <-- Or this one
    }

    // 3. Re-initialize Work Process Carousel
    const $workProcessSlider = $('#work-process-steps-container');
      if ($workProcessSlider.length > 0 && typeof $workProcessSlider.slick === 'function') {
        const workProcessOptions = $workProcessSlider.data('slick'); // Get options
        if ($workProcessSlider.hasClass('slick-initialized')) {
          $workProcessSlider.slick('unslick'); // Destroy if needed
        }
        $workProcessSlider.slick(workProcessOptions); // Initialize
        console.log("Work Process carousel re-initialized.");
      } else {
         console.log("Work Process carousel element not found or Slick not loaded for it.");
      }


    // 4. Re-initialize Testimonials Carousel (Quote and Nav)
          const $quoteSlider = $('#testimonials-l2-quote-slider');
          const $navSlider = $('#testimonials-l2-nav-slider');

          // Ensure both elements exist AND Slick function is available
          if ($quoteSlider.length > 0 && $navSlider.length > 0 && typeof $.fn.slick === 'function') {

          // --- Destroy any previous initializations ---
          if ($quoteSlider.hasClass('slick-initialized')) {
            try {
              $quoteSlider.slick('unslick');
              console.log("Existing quote slider unslicked.");
            } catch (e) { console.error("Error unslicking quote slider:", e); }
          }
          if ($navSlider.hasClass('slick-initialized')) {
              try {
              $navSlider.slick('unslick');
              console.log("Existing nav slider unslicked.");
              } catch (e) { console.error("Error unslicking nav slider:", e); }
          }

          // --- Initialize Nav Slider FIRST ---
          // (Sometimes initializing the 'nav' first helps linking)
          console.log("Initializing nav slider...");
          $navSlider.slick({
            slidesToShow: 3,
            slidesToScroll: 1,
            asNavFor: '#testimonials-l2-quote-slider', // Target ID of quote slider
            dots: false,
            arrows: false,
            focusOnSelect: true,
            infinite: false, // Match original template setting
            centerMode: false,
              responsive: [ { breakpoint: 768, settings: { slidesToShow: 2 } }, { breakpoint: 480, settings: { slidesToShow: 1 } } ]
          });

          // --- Initialize Quote Slider SECOND ---
          console.log("Initializing quote slider...");
          $quoteSlider.slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            fade: false, // Set to false as per original template structure
            asNavFor: '#testimonials-l2-nav-slider' // Target ID of nav slider
          });

          console.log("Testimonials quote and nav carousels re-initialized and linked.");

        } else {
            console.log("Testimonials carousel elements (#testimonials-l2-quote-slider or #testimonials-l2-nav-slider) not found, or Slick function is not available.");
        }
          // --- End Testimonials Re-init ---


        // 5. Re-initialize Gallery Carousel & Popup
        const $gallerySlider = $('#gallery-carousel-container');
        if ($gallerySlider.length > 0 && typeof $.fn.slick === 'function' && typeof $.fn.magnificPopup === 'function') {
          
          // Re-init Slick Carousel
          const galleryOptions = $gallerySlider.data('slick'); // Get options
          if ($gallerySlider.hasClass('slick-initialized')) {
              try { $gallerySlider.slick('unslick'); } catch(e){} // Destroy if needed
          }
          $gallerySlider.slick(galleryOptions); // Initialize Slick
          console.log("Gallery carousel re-initialized.");

          // Re-init Magnific Popup for the new gallery items
          $gallerySlider.magnificPopup({
            delegate: 'a.popup-gallery-item', // Target the links inside the slider
            type: 'image',
            tLoading: 'Loading image #%curr%...',
            mainClass: 'mfp-img-mobile',
            gallery: {
                enabled: true,
                navigateByImgClick: true,
                preload: [0, 1] // Will preload 0 - before current, and 1 after current image
            },
            image: {
                tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
            }
          });
          console.log("Magnific Popup re-initialized for gallery.");

        } else {
            console.log("Gallery carousel element not found, or Slick/Magnific Popup function not available.");
        }

    // Add similar blocks here if/when you make other carousels dynamic

    // --- CAROUSEL FIX END ---

    // Optional: Hide preloader or show page content if needed
    // $(".preloader").remove(); // Example if you want to remove preloader here

  }).catch(error => {
    console.error("An error occurred during Contentful fetching or processing:", error);
    // Handle errors, maybe show a message to the user
    // $(".preloader").remove(); // Ensure preloader is removed even on error
  });

  });

// })(); // Uncomment this line if you uncommented the first line