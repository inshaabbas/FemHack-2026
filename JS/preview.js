import { auth, db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let currentResume = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        await loadResume();
    } else {
        window.location.href = 'login.html';
    }
});

async function loadResume() {
    const urlParams = new URLSearchParams(window.location.search);
    const resumeId = urlParams.get('id');
    
    if (!resumeId) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    try {
        const docRef = doc(db, 'resumes', resumeId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            currentResume = docSnap.data();
            renderResume(currentResume);
        } else {
            alert('Resume not found');
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        console.error('Error loading resume:', error);
    }
}

function renderResume(resume) {
    const previewDiv = document.getElementById('resume-preview');
    
    // Different templates
    const templates = {
        modern: renderModernTemplate,
        classic: renderClassicTemplate,
        minimal: renderMinimalTemplate
    };
    
    const renderFunction = templates[resume.template] || renderModernTemplate;
    previewDiv.innerHTML = renderFunction(resume);
}

function renderModernTemplate(resume) {
    return `
        <div class="modern-template">
            <header class="resume-header">
                <h1 class="resume-title">${resume.personalInfo.fullName}</h1>
                <h2>${resume.personalInfo.jobTitle}</h2>
                <div class="contact-info">
                    <span>📧 ${resume.personalInfo.email}</span>
                    <span>📱 ${resume.personalInfo.phone}</span>
                    <span>📍 ${resume.personalInfo.location}</span>
                </div>
            </header>
            
            ${resume.personalInfo.summary ? `
                <section class="summary">
                    <h3>Professional Summary</h3>
                    <p>${resume.personalInfo.summary}</p>
                </section>
            ` : ''}
            
            ${resume.experience && resume.experience.length > 0 ? `
                <section class="experience">
                    <h3>Work Experience</h3>
                    ${resume.experience.map(exp => `
                        <div class="experience-item">
                            <h4>${exp.title} at ${exp.company}</h4>
                            <p class="duration">${exp.duration}</p>
                            <p class="description">${exp.description}</p>
                        </div>
                    `).join('')}
                </section>
            ` : ''}
            
            ${resume.education && resume.education.length > 0 ? `
                <section class="education">
                    <h3>Education</h3>
                    ${resume.education.map(edu => `
                        <div class="education-item">
                            <h4>${edu.degree}</h4>
                            <p>${edu.institution} | ${edu.year}</p>
                        </div>
                    `).join('')}
                </section>
            ` : ''}
            
            ${resume.skills && resume.skills.length > 0 ? `
                <section class="skills">
                    <h3>Skills</h3>
                    <div class="skills-list">
                        ${resume.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </section>
            ` : ''}
        </div>
    `;
}

function renderClassicTemplate(resume) {
    // Similar structure with classic styling
    return renderModernTemplate(resume); // Simplified for now
}

function renderMinimalTemplate(resume) {
    // Similar structure with minimal styling
    return renderModernTemplate(resume); // Simplified for now
}

// PDF Download
document.getElementById('download-pdf').addEventListener('click', () => {
    const element = document.getElementById('resume-preview');
    const opt = {
        margin: 0.5,
        filename: `${currentResume.personalInfo.fullName}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
});