import { storage } from './storage';

export interface CallSheetTemplate {
  id: string;
  name: string;
  description: string;
  branding: {
    logo?: string;
    companyName: string;
    contactInfo: {
      phone: string;
      email: string;
      address: string;
    };
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  sections: CallSheetSection[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CallSheetSection {
  id: string;
  type: 'header' | 'day_info' | 'scenes' | 'cast' | 'crew' | 'locations' | 'notes' | 'contact';
  title: string;
  fields: string[];
  order: number;
  required: boolean;
}

export interface CallSheetData {
  project: {
    title: string;
    director: string;
    producer: string;
    date: string;
    location: string;
  };
  day: {
    number: number;
    date: string;
    weather: string;
    sunrise: string;
    sunset: string;
  };
  callTimes: {
    crewCall: string;
    shootStart: string;
    lunch: string;
    wrap: string;
  };
  scenes: Array<{
    id: string;
    name: string;
    location: string;
    timeOfDay: string;
    duration: number;
    cast: string[];
    props: string[];
    notes: string;
  }>;
  cast: Array<{
    name: string;
    character: string;
    callTime: string;
    contact: string;
  }>;
  crew: Array<{
    name: string;
    role: string;
    callTime: string;
    contact: string;
  }>;
  locations: Array<{
    name: string;
    address: string;
    contact: string;
    notes: string;
  }>;
  notes: string[];
  emergencyContacts: Array<{
    name: string;
    role: string;
    phone: string;
  }>;
}

// Default templates
export const defaultTemplates: CallSheetTemplate[] = [
  {
    id: 'standard',
    name: 'Standard Call Sheet',
    description: 'Professional call sheet with all essential information',
    branding: {
      companyName: 'NollyCrew Productions',
      contactInfo: {
        phone: '+234-XXX-XXXX',
        email: 'info@nollycrew.com',
        address: 'Lagos, Nigeria'
      },
      colors: {
        primary: '#1f2937',
        secondary: '#6b7280',
        accent: '#3b82f6'
      }
    },
    sections: [
      {
        id: 'header',
        type: 'header',
        title: 'CALL SHEET',
        fields: ['project_title', 'director', 'producer', 'date', 'day_number'],
        order: 1,
        required: true
      },
      {
        id: 'day_info',
        type: 'day_info',
        title: 'DAY INFORMATION',
        fields: ['date', 'weather', 'sunrise', 'sunset', 'call_times'],
        order: 2,
        required: true
      },
      {
        id: 'scenes',
        type: 'scenes',
        title: 'SCENES TO SHOOT',
        fields: ['scene_number', 'scene_name', 'location', 'time_of_day', 'duration', 'cast', 'notes'],
        order: 3,
        required: true
      },
      {
        id: 'cast',
        type: 'cast',
        title: 'CAST CALL TIMES',
        fields: ['actor_name', 'character', 'call_time', 'contact'],
        order: 4,
        required: true
      },
      {
        id: 'crew',
        type: 'crew',
        title: 'CREW CALL TIMES',
        fields: ['crew_name', 'role', 'call_time', 'contact'],
        order: 5,
        required: true
      },
      {
        id: 'locations',
        type: 'locations',
        title: 'LOCATIONS',
        fields: ['location_name', 'address', 'contact', 'notes'],
        order: 6,
        required: true
      },
      {
        id: 'notes',
        type: 'notes',
        title: 'PRODUCTION NOTES',
        fields: ['general_notes', 'safety_notes', 'special_instructions'],
        order: 7,
        required: false
      },
      {
        id: 'emergency',
        type: 'contact',
        title: 'EMERGENCY CONTACTS',
        fields: ['contact_name', 'role', 'phone'],
        order: 8,
        required: true
      }
    ],
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'minimal',
    name: 'Minimal Call Sheet',
    description: 'Simplified call sheet for smaller productions',
    branding: {
      companyName: 'NollyCrew Productions',
      contactInfo: {
        phone: '+234-XXX-XXXX',
        email: 'info@nollycrew.com',
        address: 'Lagos, Nigeria'
      },
      colors: {
        primary: '#000000',
        secondary: '#666666',
        accent: '#ff6b35'
      }
    },
    sections: [
      {
        id: 'header',
        type: 'header',
        title: 'CALL SHEET',
        fields: ['project_title', 'date', 'day_number'],
        order: 1,
        required: true
      },
      {
        id: 'scenes',
        type: 'scenes',
        title: 'SCENES',
        fields: ['scene_name', 'location', 'time_of_day', 'cast'],
        order: 2,
        required: true
      },
      {
        id: 'cast_crew',
        type: 'cast',
        title: 'CAST & CREW',
        fields: ['name', 'role', 'call_time'],
        order: 3,
        required: true
      },
      {
        id: 'emergency',
        type: 'contact',
        title: 'EMERGENCY',
        fields: ['contact_name', 'phone'],
        order: 4,
        required: true
      }
    ],
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Generate call sheet HTML with template
export function generateCallSheetHTML(data: CallSheetData, template: CallSheetTemplate): string {
  const { branding, sections } = template;
  
  const sortedSections = sections.sort((a, b) => a.order - b.order);
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Call Sheet - ${data.project.title}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
          color: ${branding.colors.primary};
        }
        .header {
          text-align: center;
          border-bottom: 3px solid ${branding.colors.accent};
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: ${branding.colors.accent};
          margin-bottom: 10px;
        }
        .company-name {
          font-size: 18px;
          color: ${branding.colors.secondary};
          margin-bottom: 5px;
        }
        .contact-info {
          font-size: 12px;
          color: ${branding.colors.secondary};
        }
        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: ${branding.colors.primary};
          border-bottom: 2px solid ${branding.colors.accent};
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .project-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .info-item {
          margin-bottom: 8px;
        }
        .info-label {
          font-weight: bold;
          color: ${branding.colors.secondary};
        }
        .scenes-table, .cast-table, .crew-table, .locations-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        .scenes-table th, .cast-table th, .crew-table th, .locations-table th {
          background-color: ${branding.colors.accent};
          color: white;
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        .scenes-table td, .cast-table td, .crew-table td, .locations-table td {
          padding: 6px 8px;
          border-bottom: 1px solid #eee;
          font-size: 11px;
        }
        .call-times {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        .call-time {
          text-align: center;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
        .call-time-label {
          font-size: 10px;
          color: ${branding.colors.secondary};
          margin-bottom: 5px;
        }
        .call-time-value {
          font-size: 14px;
          font-weight: bold;
          color: ${branding.colors.primary};
        }
        .notes {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .emergency-contacts {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 5px;
        }
        .emergency-title {
          font-weight: bold;
          color: #856404;
          margin-bottom: 10px;
        }
        .emergency-item {
          margin-bottom: 5px;
          font-size: 12px;
        }
        @media print {
          body { margin: 0; padding: 15px; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${branding.logo ? `<img src="${branding.logo}" alt="Logo" class="logo" />` : `<div class="logo">${branding.companyName}</div>`}
        <div class="company-name">${branding.companyName}</div>
        <div class="contact-info">
          ${branding.contactInfo.phone} | ${branding.contactInfo.email} | ${branding.contactInfo.address}
        </div>
      </div>
  `;

  // Generate sections based on template
  sortedSections.forEach(section => {
    html += generateSectionHTML(section, data, branding);
  });

  html += `
    </body>
    </html>
  `;

  return html;
}

function generateSectionHTML(section: CallSheetSection, data: CallSheetData, branding: any): string {
  let html = `<div class="section">`;
  html += `<div class="section-title">${section.title}</div>`;

  switch (section.type) {
    case 'header':
      html += `
        <div class="project-info">
          <div class="info-item">
            <span class="info-label">Project:</span> ${data.project.title}
          </div>
          <div class="info-item">
            <span class="info-label">Director:</span> ${data.project.director}
          </div>
          <div class="info-item">
            <span class="info-label">Producer:</span> ${data.project.producer}
          </div>
          <div class="info-item">
            <span class="info-label">Date:</span> ${data.project.date}
          </div>
          <div class="info-item">
            <span class="info-label">Day:</span> ${data.day.number}
          </div>
          <div class="info-item">
            <span class="info-label">Location:</span> ${data.project.location}
          </div>
        </div>
      `;
      break;

    case 'day_info':
      html += `
        <div class="call-times">
          <div class="call-time">
            <div class="call-time-label">Crew Call</div>
            <div class="call-time-value">${data.callTimes.crewCall}</div>
          </div>
          <div class="call-time">
            <div class="call-time-label">Shoot Start</div>
            <div class="call-time-value">${data.callTimes.shootStart}</div>
          </div>
          <div class="call-time">
            <div class="call-time-label">Lunch</div>
            <div class="call-time-value">${data.callTimes.lunch}</div>
          </div>
          <div class="call-time">
            <div class="call-time-label">Wrap</div>
            <div class="call-time-value">${data.callTimes.wrap}</div>
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">Weather:</span> ${data.day.weather}
        </div>
        <div class="info-item">
          <span class="info-label">Sunrise:</span> ${data.day.sunrise} | <span class="info-label">Sunset:</span> ${data.day.sunset}
        </div>
      `;
      break;

    case 'scenes':
      html += `
        <table class="scenes-table">
          <thead>
            <tr>
              <th>Scene</th>
              <th>Location</th>
              <th>Time</th>
              <th>Duration</th>
              <th>Cast</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${data.scenes.map(scene => `
              <tr>
                <td>${scene.name}</td>
                <td>${scene.location}</td>
                <td>${scene.timeOfDay}</td>
                <td>${scene.duration}min</td>
                <td>${scene.cast.join(', ')}</td>
                <td>${scene.notes}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      break;

    case 'cast':
      html += `
        <table class="cast-table">
          <thead>
            <tr>
              <th>Actor</th>
              <th>Character</th>
              <th>Call Time</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            ${data.cast.map(actor => `
              <tr>
                <td>${actor.name}</td>
                <td>${actor.character}</td>
                <td>${actor.callTime}</td>
                <td>${actor.contact}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      break;

    case 'crew':
      html += `
        <table class="crew-table">
          <thead>
            <tr>
              <th>Crew Member</th>
              <th>Role</th>
              <th>Call Time</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            ${data.crew.map(member => `
              <tr>
                <td>${member.name}</td>
                <td>${member.role}</td>
                <td>${member.callTime}</td>
                <td>${member.contact}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      break;

    case 'locations':
      html += `
        <table class="locations-table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Address</th>
              <th>Contact</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${data.locations.map(location => `
              <tr>
                <td>${location.name}</td>
                <td>${location.address}</td>
                <td>${location.contact}</td>
                <td>${location.notes}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      break;

    case 'notes':
      html += `
        <div class="notes">
          ${data.notes.map(note => `<div>• ${note}</div>`).join('')}
        </div>
      `;
      break;

    case 'contact':
      html += `
        <div class="emergency-contacts">
          <div class="emergency-title">Emergency Contacts</div>
          ${data.emergencyContacts.map(contact => `
            <div class="emergency-item">
              <strong>${contact.name}</strong> (${contact.role}) - ${contact.phone}
            </div>
          `).join('')}
        </div>
      `;
      break;
  }

  html += `</div>`;
  return html;
}

// Get available templates
export async function getCallSheetTemplates(): Promise<CallSheetTemplate[]> {
  // In a real implementation, this would fetch from database
  // For now, return default templates
  return defaultTemplates;
}

// Get template by ID
export async function getCallSheetTemplate(templateId: string): Promise<CallSheetTemplate | null> {
  const templates = await getCallSheetTemplates();
  return templates.find(t => t.id === templateId) || null;
}
