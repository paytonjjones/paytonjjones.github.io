// Main application logic
class PortfolioApp {
    constructor() {
        this.data = {
            profile: null,
            experience: null,
            projects: null,
            publications: null
        };
        this.currentFilter = 'all';
    }

    async init() {
        try {
            await this.loadData();
            this.render();
            this.attachEventListeners();
            this.initScrollAnimations();
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    async loadData() {
        const dataFiles = ['profile', 'experience', 'projects', 'publications'];
        
        const promises = dataFiles.map(async (file) => {
            const response = await fetch(`data/${file}.json`);
            this.data[file] = await response.json();
        });

        await Promise.all(promises);
    }

    render() {
        this.renderProfile();
        this.renderProjects();
        this.renderExperience();
        this.renderPublications();
    }

    renderProfile() {
        const profile = this.data.profile;
        
        // Profile name, role, and organization
        document.getElementById('profile-name').textContent = profile.name;
        document.getElementById('profile-role').textContent = profile.role;
        document.getElementById('profile-org').textContent = profile.organization;
        
        // Avatar
        const avatar = document.getElementById('profile-avatar');
        avatar.src = profile.avatar;
        avatar.alt = profile.name;
        
        // Social links
        const linksContainer = document.getElementById('profile-links');
        profile.social.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.className = 'profile-link';
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.innerHTML = `<i class="${link.icon}"></i>`;
            a.title = link.name;
            linksContainer.appendChild(a);
        });
        
        // Bio in about section
        document.getElementById('about-bio').textContent = profile.bio;
        
        // Interests
        const aboutDiv = document.getElementById('about-interests');
        const interestsDiv = document.createElement('div');
        interestsDiv.className = 'interests-list';
        interestsDiv.innerHTML = '<h3>Interests</h3>';
        
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'interest-tags';
        profile.interests.forEach(interest => {
            const tag = document.createElement('span');
            tag.className = 'interest-tag';
            tag.textContent = interest;
            tagsDiv.appendChild(tag);
        });
        interestsDiv.appendChild(tagsDiv);
        aboutDiv.appendChild(interestsDiv);
        
        // Education
        const educationDiv = document.getElementById('about-education');
        educationDiv.innerHTML = '<h3>Education</h3>';
        
        profile.education.forEach(edu => {
            const item = document.createElement('div');
            item.className = 'education-item';
            item.innerHTML = `
                <div class="education-degree">${edu.degree}</div>
                <div class="education-institution">${edu.institution}</div>
                <div class="education-year">${edu.year}</div>
            `;
            educationDiv.appendChild(item);
        });
    }

    renderExperience() {
        const timeline = document.getElementById('experience-timeline');
        
        this.data.experience.forEach(job => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            const startDate = new Date(job.startDate);
            const endDate = job.current ? new Date() : new Date(job.endDate);
            const dateStr = this.formatDateRange(startDate, endDate, job.current);
            
            const descriptionHTML = job.description
                .map(desc => `<li>${desc}</li>`)
                .join('');
            
            item.innerHTML = `
                <div class="timeline-header">
                    <div>
                        <div class="timeline-title">${job.title}</div>
                        <div class="timeline-company">${job.company}</div>
                    </div>
                    <div class="timeline-date">${dateStr}</div>
                </div>
                <div class="timeline-description">
                    <ul>${descriptionHTML}</ul>
                </div>
            `;
            
            timeline.appendChild(item);
        });
    }

    renderProjects() {
        const grid = document.getElementById('projects-grid');
        
        this.data.projects.forEach(project => {
            const card = document.createElement('a');
            card.className = 'project-card';
            card.href = project.externalLink;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
            
            const tagsHTML = project.tags
                .map(tag => `<span class="project-tag">${tag}</span>`)
                .join('');
            
            card.innerHTML = `
                <img src="${project.image}" alt="${project.title}" class="project-image">
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.summary}</p>
                    <div class="project-tags">${tagsHTML}</div>
                </div>
            `;
            
            grid.appendChild(card);
        });
    }

    renderPublications() {
        const list = document.getElementById('publications-list');
        
        // Filter to only featured publications and sort by year to match live site
        const featuredPubs = this.data.publications
            .filter(pub => pub.featured)
            .sort((a, b) => a.year - b.year); // Sort oldest first like live site
        
        featuredPubs.forEach(pub => {
            const item = document.createElement('div');
            item.className = 'publication-item';
            item.dataset.type = pub.type;
            
            const authorsStr = pub.authors.join(', ');
            
            let linksHTML = '';
            if (pub.pdf) {
                linksHTML += `<a href="${pub.pdf}" class="publication-link" target="_blank"><i class="fas fa-file-pdf"></i> PDF</a>`;
            }
            if (pub.doi) {
                linksHTML += `<a href="${pub.doi}" class="publication-link" target="_blank"><i class="fas fa-external-link-alt"></i> DOI</a>`;
            }
            
            // Format venue with year like live site
            const venueWithYear = `${pub.venue}${pub.doi ? '. ' + pub.doi : ''}.`;
            
            item.innerHTML = `
                <div class="publication-authors">${authorsStr} (${pub.year}).</div>
                <h3 class="publication-title">
                    ${pub.doi ? `<a href="${pub.doi}" target="_blank">${pub.title}</a>` : pub.title}
                </h3>
                <div class="publication-venue">${pub.venue}.</div>
                ${linksHTML ? `<div class="publication-links">${linksHTML}</div>` : ''}
            `;
            
            list.appendChild(item);
        });
    }

    attachEventListeners() {
        // Mobile navigation toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        navToggle?.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
        // Close mobile menu on link click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Navbar background on scroll
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            } else {
                navbar.style.boxShadow = 'none';
            }
        });
    }

    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);
        
        // Observe all sections
        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });
        
        // Observe individual items for stagger effect
        const animatedElements = document.querySelectorAll(
            '.timeline-item, .project-card, .publication-item'
        );
        
        animatedElements.forEach((el, index) => {
            el.style.transitionDelay = `${index * 0.1}s`;
            observer.observe(el);
        });
    }

    formatDateRange(start, end, isCurrent) {
        const options = { year: 'numeric', month: 'short' };
        const startStr = start.toLocaleDateString('en-US', options);
        const endStr = isCurrent ? 'Present' : end.toLocaleDateString('en-US', options);
        return `${startStr} - ${endStr}`;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new PortfolioApp();
    app.init();
});
