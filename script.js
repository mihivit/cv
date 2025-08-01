document.addEventListener('DOMContentLoaded', () => {
    // --- CACHE UI ELEMENTS ---
    const projectGridContainer = document.getElementById('project-grid-container');
    const aboutSectionContainer = document.getElementById('about-section-container');
    const projectDetailsContainer = document.getElementById('project-details-container');
    const aboutDetailsContainer = document.getElementById('about-details-container');
    const mainContentTabs = document.querySelectorAll('.tab-navigation .tab');
    const searchInput = document.getElementById('project-search');
    const projectModal = document.getElementById('project-modal');
    const modalImage = document.getElementById('modal-image');
    const modalFileInfo = document.querySelector('.modal-file-info');
    const modalResolutionInfo = document.querySelector('.modal-resolution-info');
    const closeModalButton = document.querySelector('.close-button');
    const contactModal = document.getElementById('contact-modal');
    const contactButton = document.querySelector('.contact-btn');
    const closeContactModalButton = contactModal.querySelector('.close-button');
    const contactForm = document.getElementById('contact-form');
    const successMessage = document.getElementById('success-message');

    const rulerHorizontal = document.querySelector('.ruler-horizontal');
    const activeToolDisplay = document.querySelector('.active-tool-display');
    const rulerVertical = document.querySelector('.ruler-vertical');
    const toolIcons = document.querySelectorAll('.tool-icon');
    const panelGroups = document.querySelectorAll('.panel-group');
    const layerVisibilityToggles = document.querySelectorAll('.layers-list .visibility-toggle');

    // --- EVENT LISTENERS ---
    layerVisibilityToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const isOpen = toggle.src === toggle.dataset.openEye;
            if (isOpen) {
                toggle.src = toggle.dataset.closedEye;
            } else {
                toggle.src = toggle.dataset.openEye;
            }
        });
    });

    // Color Picker Elements
    const colorField = document.querySelector('.color-field');
    const foregroundColorSwatch = document.querySelector('.foreground-color');
    const colorInputGroups = document.querySelectorAll('.color-inputs');
    const hsbInputs = colorInputGroups[0].querySelectorAll('input[type="text"]');
    const rgbInputs = colorInputGroups[1].querySelectorAll('input[type="text"]');
    const hexInput = document.querySelector('.hex-input input[type="text"]');
    const createButton = document.querySelector('.create-btn');
    const hueSlider = document.querySelector('.hue-slider');
    const hueSliderThumb = document.createElement('div');
    hueSliderThumb.className = 'hue-slider-thumb';
    hueSliderThumb.style.left = '0%'; // Set initial position
    hueSlider.appendChild(hueSliderThumb);

    const colorFieldThumb = document.createElement('div');
    colorFieldThumb.className = 'color-field-thumb';
    colorField.appendChild(colorFieldThumb);

    let selectedProject = null;
    let currentHue = 0;
    let currentSaturation = 0;
    let currentBrightness = 0;

    // --- COLOR CONVERSION FUNCTIONS ---
    function hsbToRgb(h, s, b) {
        s /= 100;
        b /= 100;
        let c = b * s;
        let x = c * (1 - Math.abs((h / 60) % 2 - 1));
        let m = b - c;
        let r = 0, g = 0, blue = 0;
        if (0 <= h && h < 60) { r = c; g = x; blue = 0; }
        else if (60 <= h && h < 120) { r = x; g = c; blue = 0; }
        else if (120 <= h && h < 180) { r = 0; g = c; blue = x; }
        else if (180 <= h && h < 240) { r = 0; g = x; blue = c; }
        else if (240 <= h && h < 300) { r = x; g = 0; blue = c; }
        else if (300 <= h && h < 360) { r = c; g = 0; blue = x; }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        blue = Math.round((blue + m) * 255);
        return { r, g, b: blue };
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    function rgbToHsb(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s, br = max;
        let d = max - min;
        s = max === 0 ? 0 : d / max;
        if (max !== min) {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, b: br * 100 };
    }

    function hexToRgb(hex) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // --- COLOR STATE UPDATERS ---
    function updateColorDisplay(updateInputs = true) {
        const { r, g, b } = hsbToRgb(currentHue, currentSaturation, currentBrightness);

        if (updateInputs) {
            hsbInputs[0].value = Math.round(currentHue);
            hsbInputs[1].value = Math.round(currentSaturation);
            hsbInputs[2].value = Math.round(currentBrightness);
            rgbInputs[0].value = r;
            rgbInputs[1].value = g;
            rgbInputs[2].value = b;
            hexInput.value = rgbToHex(r, g, b);
        }

        colorField.style.background = `linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0)), linear-gradient(to right, rgba(255,255,255,1), hsl(${currentHue}, 100%, 50%))`;
        hueSliderThumb.style.left = `${(currentHue / 360) * 100}%`;
        
        const colorFieldRect = colorField.getBoundingClientRect();
        if (colorFieldRect.width > 0) {
            const thumbX = (currentSaturation / 100) * colorFieldRect.width;
            const thumbY = (1 - currentBrightness / 100) * colorFieldRect.height;
            colorFieldThumb.style.left = `${thumbX}px`;
            colorFieldThumb.style.top = `${thumbY}px`;
        }

        // Update tab navigation colors
        mainContentTabs.forEach(tab => {
            if (tab.classList.contains('active')) {
                tab.style.background = `rgb(${r}, ${g}, ${b})`;
                tab.style.color = '#fff';
            } else {
                tab.style.color = `rgb(${r}, ${g}, ${b})`;
                tab.style.background = 'transparent';
            }
        });

        contactButton.style.background = `rgb(${r}, ${g}, ${b})`;

        const sendButton = document.querySelector('.send-btn');
        if (sendButton) {
            sendButton.style.background = `rgb(${r}, ${g}, ${b})`;
        }

        // Update selected tool icon color
        const activeToolIcon = document.querySelector('.tool-icon.active');
        if (activeToolIcon) {
            activeToolIcon.style.background = `rgb(${r}, ${g}, ${b})`;
        }

        // Update selected layer color
        const activeLayer = document.querySelector('.layers-list .layer-item.active');
        if (activeLayer) {
            activeLayer.style.background = `rgb(${r}, ${g}, ${b})`;
        }

        // Update selected project tile color
        const selectedProjectTile = document.querySelector('.project-tile.selected');
        if (selectedProjectTile) {
            selectedProjectTile.style.borderColor = `rgb(${r}, ${g}, ${b})`;
            selectedProjectTile.style.boxShadow = `0 0 8px rgba(${r}, ${g}, ${b}, 0.5)`;
        }

        const dropdownArrows = document.querySelectorAll('.dropdown-arrow');
        dropdownArrows.forEach(arrow => {
            arrow.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        });

        // Dispatch custom event with current RGB color
        document.dispatchEvent(new CustomEvent('colorUpdated', {
            detail: { r, g, b }
        }));
    }

    function handleHsbInputChange() {
        let h = parseInt(hsbInputs[0].value, 10) || 0;
        let s = parseInt(hsbInputs[1].value, 10) || 0;
        let b = parseInt(hsbInputs[2].value, 10) || 0;

        currentHue = Math.max(0, Math.min(360, h));
        currentSaturation = Math.max(0, Math.min(100, s));
        currentBrightness = Math.max(0, Math.min(100, b));

        updateColorDisplay(false);
    }

    function handleRgbInputChange() {
        let r = parseInt(rgbInputs[0].value, 10) || 0;
        let g = parseInt(rgbInputs[1].value, 10) || 0;
        let b = parseInt(rgbInputs[2].value, 10) || 0;

        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));

        const hsb = rgbToHsb(r, g, b);
        currentHue = hsb.h;
        currentSaturation = hsb.s;
        currentBrightness = hsb.b;

        updateColorDisplay(false);
    }

    function handleHexInputChange() {
        const hex = hexInput.value;
        const rgb = hexToRgb(hex);
        if (rgb) {
            const hsb = rgbToHsb(rgb.r, rgb.g, rgb.b);
            currentHue = hsb.h;
            currentSaturation = hsb.s;
            currentBrightness = hsb.b;
            // Update the color picker, but not the inputs while typing
            updateColorDisplay(false); 
        }
    }

    // --- FUNCTIONALITY ---

    // 1. Generate Rulers
    function generateRulers() {
        // Clear existing rulers
        rulerHorizontal.innerHTML = '';
        rulerVertical.innerHTML = '';

        // Horizontal Ruler
        for (let i = 0; i < 5000; i += 50) { // Generate for a large width
            const tick = document.createElement('div');
            const isMajor = i % 100 === 0;
            tick.className = `ruler-tick ${isMajor ? 'major' : 'minor'}`;
            tick.style.left = `${i}px`;
            
            if (isMajor) {
                const number = document.createElement('span');
                number.className = 'ruler-number';
                number.textContent = i;
                tick.appendChild(number);
            }
            rulerHorizontal.appendChild(tick);
        }

        // Vertical Ruler
        for (let i = 0; i < 3000; i += 50) { // Generate for a large height
            const tick = document.createElement('div');
            const isMajor = i % 100 === 0;
            tick.className = `ruler-tick ${isMajor ? 'major' : 'minor'}`;
            tick.style.top = `${i}px`;

            if (isMajor) {
                const number = document.createElement('span');
                number.className = 'ruler-number';
                number.textContent = i;
                tick.appendChild(number);
            }
            rulerVertical.appendChild(tick);
        }
    }

    // 2. Panel Tabbing
    panelGroups.forEach(group => {
        const tabs = group.querySelectorAll('.panel-header .tab');
        // This is a simplified tabbing logic for visual purposes
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const currentActive = group.querySelector('.tab.active');
                if (currentActive) currentActive.classList.remove('active');
                tab.classList.add('active');
            });
        });
    });

    // 3. Project Rendering (Existing Logic)
    function renderProjects(filterCategory, searchTerm = '') {
        projectGridContainer.style.display = 'grid';
        projectDetailsContainer.style.display = 'block';
        aboutSectionContainer.style.display = 'none';
        aboutDetailsContainer.style.display = 'none';

        projectGridContainer.innerHTML = '';
        projectDetailsContainer.innerHTML = '<h2>Project Details</h2><p>Select a project to view details.</p>';

        let projectsToRender = projects;
        if (filterCategory !== 'all') {
            projectsToRender = projects.filter(p => p.category === filterCategory);
        }
        if (searchTerm) {
            projectsToRender = projectsToRender.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (projectsToRender.length === 0) {
            projectGridContainer.innerHTML = '<p>No projects found.</p>';
            return;
        }

        projectsToRender.forEach((project, index) => {
            const tile = document.createElement('div');
            tile.className = 'project-tile';
            tile.dataset.projectId = project.id;
            tile.innerHTML = `<img src="${project.thumbnail}" alt="${project.title}"><h3>${project.title}</h3><p>${project.resolutionPx}</p>`;
            
            // Staggered animation
            tile.style.animation = `tile-fade-in 0.5s ease-out forwards`;
            tile.style.animationDelay = `${index * 0.05}s`;

            tile.addEventListener('click', (e) => {
                if (!e.target.matches('img')) {
                    const prevTile = projectGridContainer.querySelector('.selected');
                    if (prevTile) {
                        prevTile.classList.remove('selected');
                        // Reset the inline styles so the CSS class can take over
                        prevTile.style.borderColor = '';
                        prevTile.style.boxShadow = '';
                    }
                    tile.classList.add('selected');
                    selectedProject = project;
                    updateProjectDetails(project);
                    // Apply the current color to the new selection
                    updateColorDisplay();
                }
            });

            const imgElement = tile.querySelector('img');
            console.log('Found imgElement:', imgElement);
            imgElement.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent click from bubbling to the tile
                console.log('Image clicked, attempting to show modal.');
                modalImage.src = project.fullImage;
                modalFileInfo.textContent = `${project.fileName} @ ${project.fileSize}`;
                modalResolutionInfo.textContent = `${project.resolutionPx} (${project.resolutionPpi})`;
                console.log('Attempting to show modal for project:', project.title);
                projectModal.style.display = 'flex';
            });

            projectGridContainer.appendChild(tile);
        });

        const firstTile = projectGridContainer.querySelector('.project-tile');
        if (firstTile) {
            firstTile.click();
        }
    }

    function updateProjectDetails(project) {
        projectDetailsContainer.innerHTML = `
            <h2>${project.title}</h2>
            <p><strong>Category:</strong> ${project.category}</p>
            ${project.overview ? `<h3>Overview:</h3><p>${project.overview}</p>` : ''}
            ${project.conceptVisualLanguage ? `<h3>Concept & Visual Identity:</h3><p>${project.conceptVisualLanguage}</p>` : ''}
            ${project.deliverablesIncluded ? `<h3>Deliverables Included:</h3>${project.deliverablesIncluded}` : ''}
            <p><strong>Technologies:</strong> ${project.technologies.join(', ')}</p>
            ${project.link ? `<a href="${project.link}" target="_blank">View Project</a>` : ''}
        `;
    }

    function renderAboutMe() {
        projectGridContainer.style.display = 'none';
        projectDetailsContainer.style.display = 'none';
        aboutSectionContainer.style.display = 'block';
        aboutDetailsContainer.style.display = 'block';
        aboutSectionContainer.innerHTML = `<h2>About Me</h2><p>Detailed bio and information about my professional background, skills, and experience.</p>`;
        aboutDetailsContainer.innerHTML = `<h2>My Philosophy</h2><p>My approach to design, problem-solving, and collaboration.</p>`;
    }

    // --- EVENT LISTENERS ---
    layerVisibilityToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const isOpen = toggle.src === toggle.dataset.openEye;
            if (isOpen) {
                toggle.src = toggle.dataset.closedEye;
            } else {
                toggle.src = toggle.dataset.openEye;
            }
        });
    });
    mainContentTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            mainContentTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const category = tab.dataset.category;
            if (category === 'about') {
                renderAboutMe();
            } else {
                renderProjects(category, searchInput.value);
            }
            // Re-apply colors after tab change
            updateColorDisplay();
        });
    });

    searchInput.addEventListener('input', () => {
        const activeTab = document.querySelector('.tab-navigation .tab.active');
        const category = activeTab ? activeTab.dataset.category : 'all';
        if (category !== 'about') {
            renderProjects(category, searchInput.value);
        }
    });

    closeModalButton.addEventListener('click', () => projectModal.style.display = 'none');
    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) projectModal.style.display = 'none';
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            projectModal.style.display = 'none';
            contactModal.style.display = 'none';
        }
    });

    // --- CONTACT MODAL --- 
    contactButton.addEventListener('click', () => {
        contactModal.style.display = 'flex';
    });

    closeContactModalButton.addEventListener('click', () => {
        contactModal.style.display = 'none';
    });

    contactModal.addEventListener('click', (e) => {
        if (e.target === contactModal) {
            contactModal.style.display = 'none';
        }
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.preventDefault(); // Prevent default form submission

        // Initialize EmailJS with your Public Key
        emailjs.init("oIXGNYKCfosAgEx7s");

        const formData = new FormData(contactForm);
        const templateParams = {
            from_name: formData.get('name'),
            from_email: formData.get('email'),
            message: formData.get('message')
        };

        emailjs.send("service_s67ol68", "template_zorxbgu", templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                // Hide form and show success message
                contactForm.style.display = 'none';
                successMessage.style.display = 'block';

                // Optional: Reset form and hide modal after a delay
                setTimeout(() => {
                    contactModal.style.display = 'none';
                    contactForm.style.display = 'block'; // Reset for next time
                    successMessage.style.display = 'none';
                    contactForm.reset();
                }, 3000); // Close after 3 seconds

            }, function(error) {
                console.log('FAILED...', error);
                alert('Failed to send message. Please try again later.');
            });
    });

    toolIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const currentActive = document.querySelector('.tool-icon.active');
            if (currentActive) {
                currentActive.classList.remove('active');
                currentActive.style.background = ''; // Reset background
            }
            icon.classList.add('active');
            activeToolDisplay.textContent = icon.title; // Update active tool display
            updateColorDisplay(); // Apply current color to new active icon

            const svgElement = icon.querySelector('svg');
            if (svgElement) {
                const clonedSvg = svgElement.cloneNode(true);
                clonedSvg.setAttribute('width', '32');
                clonedSvg.setAttribute('height', '32');

                // Set the fill of all path/rect elements to white
                clonedSvg.querySelectorAll('path, rect').forEach(el => el.setAttribute('fill', 'white'));

                // Get the current color from the color picker for the glow
                const { r, g, b } = hsbToRgb(currentHue, currentSaturation, currentBrightness);
                const glowColor = `rgb(${r},${g},${b})`;

                const originalContent = clonedSvg.innerHTML;
                const filterId = 'cursor-glow-dynamic';

                const defs = `
                    <defs>
                        <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="0" stdDeviation="4.5" flood-color="${glowColor}" flood-opacity="1" />
                        </filter>
                    </defs>
                `;

                clonedSvg.innerHTML = `${defs}<g filter="url(#${filterId})">${originalContent}</g>`;

                const svgData = new XMLSerializer().serializeToString(clonedSvg);
                const cursorUrl = `url('data:image/svg+xml;base64,${btoa(svgData)}')`;
                document.body.style.cursor = `${cursorUrl} 16 16, auto`;

            } else {
                const imgElement = icon.querySelector('img');
                if (imgElement) {
                    document.body.style.cursor = `url('${imgElement.src}') 16 16, auto`;
                }
            }
        });
    });

    

    let isDraggingHue = false;
    let isDraggingColorField = false;

    hueSlider.addEventListener('mousedown', (e) => {
        isDraggingHue = true;
        updateHue(e);
    });

    colorField.addEventListener('mousedown', (e) => {
        isDraggingColorField = true;
        updateColorField(e);
    });

    document.addEventListener('mousemove', (e) => {
        if (isDraggingHue) {
            updateHue(e);
        } else if (isDraggingColorField) {
            updateColorField(e);
        }
    });

    document.addEventListener('mouseup', () => {
        isDraggingHue = false;
        isDraggingColorField = false;
    });

    // Use 'input' for real-time updates
    hsbInputs.forEach(input => input.addEventListener('input', handleHsbInputChange));
    rgbInputs.forEach(input => input.addEventListener('input', handleRgbInputChange));
    hexInput.addEventListener('input', handleHexInputChange);

    // Update the display when the user finishes editing (e.g., clicks away)
    hsbInputs.forEach(input => input.addEventListener('change', () => updateColorDisplay()));
    rgbInputs.forEach(input => input.addEventListener('change', () => updateColorDisplay()));
    hexInput.addEventListener('change', () => updateColorDisplay());

    function updateHue(e) {
        const rect = hueSlider.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width)); // Clamp x within the slider bounds
        currentHue = (x / rect.width) * 360;
        hueSliderThumb.style.left = `${(currentHue / 360) * 100}%`; // Directly update thumb position
        updateColorDisplay();
    }

    function updateColorField(e) {
        const rect = colorField.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        x = Math.max(0, Math.min(x, rect.width));
        y = Math.max(0, Math.min(y, rect.height));

        currentSaturation = (x / rect.width) * 100;
        currentBrightness = 100 - (y / rect.height) * 100;

        updateColorDisplay();
    }

    // --- INITIALIZATION ---
    generateRulers();
    renderAboutMe();

    // Set initial color for the foreground swatch, active tab, and create button
    currentHue = 36; // Orange hue for #F0A532
    currentSaturation = 79; // Orange saturation for #f0a532
    currentBrightness = 94; // Orange brightness for #F0A532
    updateColorDisplay();

    // Set initial active tool display
    const initialActiveTool = document.querySelector('.tool-icon.active');
    if (initialActiveTool) {
        activeToolDisplay.textContent = initialActiveTool.title;
    }
});