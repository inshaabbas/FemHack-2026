import { auth, db } from './firebase-config.js';
import { collection, query, where, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let currentUser = null;
let allResumes = [];


onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('user-email').textContent = user.email;
        loadResumes();
    } else {
        window.location.href = 'login.html';
    }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
});


async function loadResumes() {
    try {
        const q = query(collection(db, 'resumes'), where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        allResumes = [];
        querySnapshot.forEach((doc) => {
            allResumes.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        displayResumes(allResumes);
        
    } catch (error) {
        console.error('Error loading resumes:', error);
    }
}

function displayResumes(resumes) {
    const resumesGrid = document.getElementById('resumes-grid');
    
    if (resumes.length === 0) {
        resumesGrid.innerHTML = '<p class="no-resumes">No resumes yet. Create your first one!</p>';
        return;
    }
    
    resumesGrid.innerHTML = resumes.map(resume => `
        <div class="resume-card">
            <div class="resume-header">
                <h3>${resume.personalInfo.fullName}</h3>
                <span class="template-badge">${resume.template}</span>
            </div>
            <p class="job-title">${resume.personalInfo.jobTitle}</p>
            <p class="created-date">Created: ${new Date(resume.createdAt).toLocaleDateString()}</p>
            <div class="resume-actions">
                <button class="btn-view" onclick="viewResume('${resume.id}')">View</button>
                <button class="btn-edit" onclick="editResume('${resume.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteResume('${resume.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

document.getElementById('search-input').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allResumes.filter(resume => 
        resume.personalInfo.fullName.toLowerCase().includes(searchTerm) ||
        resume.personalInfo.jobTitle.toLowerCase().includes(searchTerm) ||
        resume.skills.some(skill => skill.toLowerCase().includes(searchTerm))
    );
    displayResumes(filtered);
});

document.getElementById('template-filter').addEventListener('change', (e) => {
    const template = e.target.value;
    const filtered = template ? allResumes.filter(r => r.template === template) : allResumes;
    displayResumes(filtered);
});

window.viewResume = function(id) {
    window.location.href = `preview-resume.html?id=${id}`;
};

window.editResume = function(id) {
    window.location.href = `edit-resume.html?id=${id}`;
};

window.deleteResume = async function(id) {
    if (confirm('Are you sure you want to delete this resume?')) {
        try {
            await deleteDoc(doc(db, 'resumes', id));
            loadResumes(); 
        } catch (error) {
            console.error('Error deleting resume:', error);
            alert('Failed to delete resume');
        }
    }
};