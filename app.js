// LettingsPulse Exeter Dual-Engine (Works on GitHub Pages & Full Backend)

let currentSenderId = "demo_student_" + Math.floor(Math.random() * 10000);

// Default Exeter Student HMO Dataset
const DEFAULT_PROPERTIES = [
    {
        id: "prop_victoria_5bed",
        title: "5-Bed Victorian Student HMO on Victoria Street",
        street_address: "42 Victoria Street",
        postcode: "EX4 6JJ",
        area: "Pennsylvania",
        campus_proximity: "Streatham",
        bedrooms: 5,
        bathrooms: 2,
        price_pppw: 185.00,
        bills_included: true,
        image_urls: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"],
        description: "Stunning 5 double-bedroom Victorian home in prime Pennsylvania location. Only 8 mins walk to Streatham Campus & Forum. Modern open-plan kitchen/lounge with 55' 4K TV, washer/dryer, high-speed 350Mbps Virgin broadband, and sunny rear garden with BBQ patio."
    },
    {
        id: "prop_mountpleasant_6bed",
        title: "6-Bed Townhouse on Mount Pleasant Road",
        street_address: "118 Mount Pleasant Road",
        postcode: "EX4 7AE",
        area: "Mount Pleasant",
        campus_proximity: "Both",
        bedrooms: 6,
        bathrooms: 3,
        price_pppw: 168.00,
        bills_included: true,
        image_urls: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800"],
        description: "Generous 6-bed student house ideally situated between Streatham and St Luke's campuses. Featuring 3 full bathrooms, spacious communal lounge, separate utility room, and private rear courtyard. Inclusive of all gas, electricity, water, and broadband."
    },
    {
        id: "prop_longbrook_4bed",
        title: "4-Bed Luxury Student Home on Longbrook Street",
        street_address: "15 Longbrook Street",
        postcode: "EX4 6AB",
        area: "City Centre",
        campus_proximity: "Streatham",
        bedrooms: 4,
        bathrooms: 2,
        price_pppw: 195.00,
        bills_included: true,
        image_urls: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"],
        description: "High-spec 4-bedroom property located moments from John Lewis, Princesshay, and just 10 mins walk to Streatham Campus. Features designer furnishings, integrated Bosch appliances, and all bills included."
    },
    {
        id: "prop_oldtiverton_7bed",
        title: "7-Bed Substantial HMO on Old Tiverton Road",
        street_address: "84 Old Tiverton Road",
        postcode: "EX4 6LG",
        area: "St James",
        campus_proximity: "Streatham",
        bedrooms: 7,
        bathrooms: 3,
        price_pppw: 170.00,
        bills_included: true,
        image_urls: ["https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800"],
        description: "Huge 7 double-bedroom student house with extra large communal living space. 3 modern bathrooms with rainfall showers. Large south-facing garden, bike storage, and private driveway parking for 2 cars. 12 mins walk to campus."
    },
    {
        id: "prop_southst_4bed",
        title: "4-Bed Contemporary Apartment on South Street",
        street_address: "62 South Street",
        postcode: "EX1 1EE",
        area: "St Davids",
        campus_proximity: "St Lukes",
        bedrooms: 4,
        bathrooms: 2,
        price_pppw: 155.00,
        bills_included: false,
        image_urls: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"],
        description: "Affordable 4-bedroom modern flat situated close to Exeter Quay and St Luke's campus. Open plan kitchen-diner, double glazing throughout, energy-efficient heating."
    },
    {
        id: "prop_howell_5bed",
        title: "5-Bed Period House on Howell Road",
        street_address: "29 Howell Road",
        postcode: "EX4 4LQ",
        area: "Pennsylvania",
        campus_proximity: "Streatham",
        bedrooms: 5,
        bathrooms: 2,
        price_pppw: 180.00,
        bills_included: true,
        image_urls: ["https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800"],
        description: "Prime location 5-bed house directly behind Exeter St David's Station with a short scenic stroll through the woods up to Streatham Campus. Character features, large bedrooms, high-speed WiFi."
    }
];

let allProperties = [...DEFAULT_PROPERTIES];
let localConversationState = {
    step: "greeting",
    group_size: null,
    max_pppw: null,
    area: null,
    campus: null,
    interested_property_id: null,
    selected_slot: null
};

// Initial Seed Bookings in LocalStorage
function getStoredBookings() {
    const saved = localStorage.getItem("lp_viewings");
    if (saved) {
        try { return JSON.parse(saved); } catch(e){}
    }
    const initial = [
        {
            id: "bkg_01",
            property: DEFAULT_PROPERTIES[0],
            lead_tenant_name: "Alex Turner",
            lead_tenant_email: "at521@exeter.ac.uk",
            lead_tenant_phone: "07700900123",
            group_size: 5,
            scheduled_time: new Date(Date.now() + 86400000 * 2).toISOString(),
            status: "confirmed"
        },
        {
            id: "bkg_02",
            property: DEFAULT_PROPERTIES[1],
            lead_tenant_name: "James Wilson (Medics Group)",
            lead_tenant_email: "jw891@exeter.ac.uk",
            lead_tenant_phone: "07700900456",
            group_size: 6,
            scheduled_time: new Date(Date.now() + 86400000 * 3).toISOString(),
            status: "confirmed"
        }
    ];
    localStorage.setItem("lp_viewings", JSON.stringify(initial));
    return initial;
}

document.addEventListener("DOMContentLoaded", () => {
    initChat();
    loadDashboardStats();
    loadProperties();
    loadViewings();
});

// Tab Switching
function switchTab(tabId) {
    const tabs = ['simulator', 'dashboard', 'properties', 'viewings', 'widget'];
    tabs.forEach(t => {
        const section = document.getElementById(`tab-${t}`);
        const btn = document.getElementById(`tab-btn-${t}`);
        if (section && btn) {
            if (t === tabId) {
                section.classList.remove('hidden');
                btn.className = "px-4 py-1.5 rounded-lg text-sm font-medium text-white bg-sky-600 transition shadow-sm";
            } else {
                section.classList.add('hidden');
                btn.className = "px-4 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition";
            }
        }
    });

    if (tabId === 'dashboard') loadDashboardStats();
    if (tabId === 'properties') loadProperties();
    if (tabId === 'viewings') loadViewings();
    if (window.lucide) lucide.createIcons();
}

// -------------------------------------------------------------
// CHAT & SIMULATOR LOGIC
// -------------------------------------------------------------

function initChat() {
    const chatContainer = document.getElementById('chat-messages');
    chatContainer.innerHTML = '';
    localConversationState = {
        step: "greeting",
        group_size: null,
        max_pppw: null,
        area: null,
        campus: null,
        interested_property_id: null,
        selected_slot: null
    };

    appendBotMessage(
        "👋 Hi there! Welcome to **Students@Cardens** in Exeter.\n\n" +
        "I can help your group find and secure student accommodation for the 2026/27 academic year.\n\n" +
        "To get started, tell me: **How many people are in your group?** (e.g. 4, 5, 6, 7 bed) and what is your target **budget per person** (£pppw)?"
    );
}

function resetConversation() {
    currentSenderId = "demo_student_" + Math.floor(Math.random() * 10000);
    initChat();
}

function sendQuickPrompt(promptText) {
    const input = document.getElementById('chat-input');
    input.value = promptText;
    sendChatMessage();
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    appendUserMessage(text);
    input.value = '';

    const typingId = showTypingIndicator();

    // Try live API backend first, fallback to client-side standalone engine on GitHub Pages
    try {
        const response = await fetch('/api/chat/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender_id: currentSenderId,
                message: text,
                agency_slug: "cardens-exeter",
                channel: "web"
            })
        });

        if (response.ok) {
            const data = await response.json();
            removeTypingIndicator(typingId);
            appendBotMessage(data.reply, data.recommended_properties);
            if (data.booking_confirmed) {
                loadDashboardStats();
                loadViewings();
            }
            return;
        }
    } catch (e) {
        // Run client-side static engine
    }

    // Client-side fallback simulation (for GitHub Pages standalone)
    setTimeout(() => {
        removeTypingIndicator(typingId);
        const res = processClientSideMessage(text);
        appendBotMessage(res.reply, res.recommended_properties);
        if (res.booking_confirmed) {
            loadDashboardStats();
            loadViewings();
        }
    }, 600);
}

function processClientSideMessage(msg) {
    const lower = msg.toLowerCase();
    let recommended = [];
    let booking = null;

    // Criteria extraction
    if (lower.includes("5") || lower.includes("five")) localConversationState.group_size = 5;
    else if (lower.includes("6") || lower.includes("six")) localConversationState.group_size = 6;
    else if (lower.includes("4") || lower.includes("four")) localConversationState.group_size = 4;
    else if (lower.includes("7") || lower.includes("seven")) localConversationState.group_size = 7;

    if (lower.includes("pennsylvania")) localConversationState.area = "Pennsylvania";
    else if (lower.includes("mount pleasant")) localConversationState.area = "Mount Pleasant";
    else if (lower.includes("victoria")) localConversationState.area = "Victoria";
    else if (lower.includes("longbrook")) localConversationState.area = "Longbrook";

    if (lower.includes("luke")) localConversationState.campus = "St Lukes";
    else if (lower.includes("streatham")) localConversationState.campus = "Streatham";

    // Case 1: Booking Confirmation
    if (localConversationState.interested_property_id && (lower.includes("@") || lower.includes("option 1") || lower.includes("2:00") || lower.includes("sarah") || lower.includes("confirm"))) {
        const prop = allProperties.find(p => p.id === localConversationState.interested_property_id) || allProperties[0];
        
        let leadName = "Sarah Jenkins";
        let leadEmail = "sj412@exeter.ac.uk";
        let leadPhone = "07700900123";

        const emailMatch = msg.match(/[\w\.-]+@[\w\.-]+\.\w+/);
        if (emailMatch) leadEmail = emailMatch[0];

        const phoneMatch = msg.match(/(?:(?:\+44\s?|\+44\s?\(0\)\s?|0)\d{4}\s?\d{6}|\d{10,11})/);
        if (phoneMatch) leadPhone = phoneMatch[0];

        const newBooking = {
            id: "bkg_" + Date.now(),
            property: prop,
            lead_tenant_name: leadName,
            lead_tenant_email: leadEmail,
            lead_tenant_phone: leadPhone,
            group_size: localConversationState.group_size || prop.bedrooms,
            scheduled_time: new Date(Date.now() + 86400000 * 2).toISOString(),
            status: "confirmed"
        };

        const existing = getStoredBookings();
        existing.unshift(newBooking);
        localStorage.setItem("lp_viewings", JSON.stringify(existing));

        booking = newBooking;
        const reply = `🎉 **Viewing Confirmed!**\n\nYou're all booked in to view **${prop.title}** on **Tomorrow at 2:00 PM**.\n\n📍 **Meeting Point:** ${prop.street_address}, ${prop.postcode}\n👤 **Lead Tenant:** ${leadName} (${leadEmail})\n👥 **Group Size:** ${newBooking.group_size} students\n\nA calendar invite and statutory notice to current tenants have been dispatched. Our negotiator will meet you outside the house 5 minutes before your slot.\n\nWould you like to view any other houses in Pennsylvania while you're in the area?`;
        return { reply, recommended_properties: [], booking_confirmed: booking };
    }

    // Case 2: Request Viewing
    if (lower.includes("view") || lower.includes("book") || lower.includes("see") || lower.includes("look around")) {
        const prop = allProperties.find(p => p.id === localConversationState.interested_property_id) || allProperties[0];
        localConversationState.interested_property_id = prop.id;

        const reply = `Fantastic choice! I can schedule an in-person viewing for **${prop.title}** (${prop.area}).\n\nTo give current tenants statutory 24-hour notice, here are our next 3 available slots:\n• **1️⃣ Tomorrow (Wednesday) at 2:00 PM**\n• **2️⃣ Tomorrow (Wednesday) at 4:30 PM**\n• **3️⃣ Thursday at 11:00 AM**\n\nWhich slot suits your housemates best? Just reply with your preferred slot number and your Exeter email address!`;
        return { reply, recommended_properties: [prop], booking_confirmed: null };
    }

    // Case 3: Property Recommendations
    let matched = allProperties;
    if (localConversationState.group_size) {
        matched = allProperties.filter(p => p.bedrooms === localConversationState.group_size);
    }
    if (localConversationState.area) {
        const areaMatched = matched.filter(p => p.area.toLowerCase().includes(localConversationState.area.toLowerCase()));
        if (areaMatched.length > 0) matched = areaMatched;
    }

    if (matched.length === 0) matched = allProperties.slice(0, 2);

    localConversationState.interested_property_id = matched[0].id;
    recommended = matched.slice(0, 2);

    let housesText = "";
    recommended.forEach((p, idx) => {
        const bills = p.bills_included ? "Bills Included (Gas/Elec/Water/WiFi)" : "Bills Excluded";
        housesText += `🏡 **Option ${idx+1}: ${p.title}**\n• **Rent:** £${p.price_pppw.toFixed(2)} pppw (${bills})\n• **Location:** ${p.street_address}, ${p.area} (${p.campus_proximity} proximity)\n• **Details:** ${p.bedrooms} Double Beds, ${p.bathrooms} Bathrooms\n\n`;
    });

    const reply = `Great news! We have matching student homes for your group:\n\n${housesText}Would you and your housemates like to book an in-person viewing for **${matched[0].title}**?`;
    return { reply, recommended_properties: recommended, booking_confirmed: null };
}

function appendUserMessage(text) {
    const chatContainer = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex justify-end';
    msgDiv.innerHTML = `
        <div class="chat-bubble-sent px-3.5 py-2.5 rounded-2xl max-w-[85%] text-xs shadow">
            ${escapeHtml(text)}
        </div>
    `;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function appendBotMessage(markdownText, properties = []) {
    const chatContainer = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex justify-start';

    let formattedText = formatMarkdown(markdownText);

    let propCardsHtml = '';
    if (properties && properties.length > 0) {
        propCardsHtml = '<div class="mt-3 space-y-2">';
        properties.forEach(p => {
            const billsText = p.bills_included ? 'Bills Inc' : 'Bills Exc';
            const img = p.image_url || (p.image_urls ? p.image_urls[0] : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800');
            propCardsHtml += `
                <div class="chat-property-card p-2.5 rounded-xl border border-slate-700 bg-slate-900/90 flex space-x-3 items-center">
                    <img src="${img}" class="w-16 h-16 rounded-lg object-cover flex-shrink-0" alt="property">
                    <div class="flex-1 min-w-0">
                        <h4 class="text-xs font-bold text-white truncate">${p.title}</h4>
                        <p class="text-[11px] text-slate-400 truncate">${p.street_address}, ${p.area}</p>
                        <div class="flex items-center space-x-2 mt-1">
                            <span class="text-xs font-extrabold text-sky-400">£${p.price_pppw.toFixed(2)} pppw</span>
                            <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">${billsText}</span>
                            <span class="text-[10px] text-slate-400">${p.bedrooms} Beds</span>
                        </div>
                    </div>
                </div>
            `;
        });
        propCardsHtml += '</div>';
    }

    msgDiv.innerHTML = `
        <div class="chat-bubble-received px-3.5 py-2.5 rounded-2xl max-w-[88%] text-xs shadow border border-slate-800/80">
            <div class="space-y-1.5 leading-relaxed">${formattedText}</div>
            ${propCardsHtml}
        </div>
    `;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showTypingIndicator() {
    const chatContainer = document.getElementById('chat-messages');
    const typingId = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.id = typingId;
    div.className = 'flex justify-start';
    div.innerHTML = `
        <div class="bg-slate-900 text-slate-400 text-[11px] px-3 py-2 rounded-2xl border border-slate-800 flex items-center space-x-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" style="animation-delay: 0.2s"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" style="animation-delay: 0.4s"></span>
            <span class="ml-1 text-slate-400">Agent typing...</span>
        </div>
    `;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return typingId;
}

function removeTypingIndicator(id) {
    const elem = document.getElementById(id);
    if (elem) elem.remove();
}

function formatMarkdown(text) {
    let html = escapeHtml(text);
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
    return html;
}

function escapeHtml(string) {
    return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// -------------------------------------------------------------
// DASHBOARD STATS
// -------------------------------------------------------------

function loadDashboardStats() {
    const bookings = getStoredBookings();
    const totalBookings = bookings.length;
    const totalInquiries = 14 + totalBookings * 2;
    const qualifiedGroups = 9 + totalBookings;
    const commission = totalBookings * 4200 * 0.4;

    const inqElem = document.getElementById('stat-total-inquiries');
    const grpElem = document.getElementById('stat-qualified-groups');
    const bkgElem = document.getElementById('stat-booked-viewings');
    const comElem = document.getElementById('stat-pipeline-commission');

    if (inqElem) inqElem.innerText = totalInquiries;
    if (grpElem) grpElem.innerText = qualifiedGroups;
    if (bkgElem) bkgElem.innerText = totalBookings;
    if (comElem) comElem.innerText = '£' + Math.round(commission).toLocaleString();

    renderActivityFeed();
}

function renderActivityFeed() {
    const container = document.getElementById('dashboard-activity-list');
    if (!container) return;

    const activities = [
        { icon: 'users', color: 'text-indigo-400', title: '5-bed student group qualified (Streatham / Pennsylvania)', time: '3 mins ago' },
        { icon: 'calendar', color: 'text-emerald-400', title: 'Viewing booked: 42 Victoria Street for Tomorrow 2:00 PM', time: '14 mins ago' },
        { icon: 'message-square', color: 'text-sky-400', title: 'WhatsApp inquiry from 07700900123 answered in 2.8s', time: '22 mins ago' },
        { icon: 'check-circle', color: 'text-emerald-400', title: 'Statutory 24h notice SMS dispatched to current tenants', time: '1 hour ago' }
    ];

    container.innerHTML = activities.map(a => `
        <div class="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div class="flex items-center space-x-3">
                <i data-lucide="${a.icon}" class="w-4 h-4 ${a.color}"></i>
                <span class="text-xs text-slate-200">${a.title}</span>
            </div>
            <span class="text-[11px] text-slate-500">${a.time}</span>
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
}

// -------------------------------------------------------------
// PROPERTIES INVENTORY
// -------------------------------------------------------------

function loadProperties() {
    renderProperties(allProperties);
}

function filterProperties() {
    const beds = document.getElementById('property-filter-bedrooms').value;
    if (!beds) {
        renderProperties(allProperties);
    } else {
        const filtered = allProperties.filter(p => p.bedrooms === parseInt(beds));
        renderProperties(filtered);
    }
}

function renderProperties(props) {
    const grid = document.getElementById('properties-grid');
    if (!grid) return;

    if (props.length === 0) {
        grid.innerHTML = '<p class="text-sm text-slate-400 col-span-3">No properties matching filters.</p>';
        return;
    }

    grid.innerHTML = props.map(p => {
        const billsBadge = p.bills_included 
            ? '<span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">Bills Included</span>'
            : '<span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-semibold">Bills Excluded</span>';

        const img = p.image_urls ? p.image_urls[0] : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800';

        return `
            <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-sky-500/50 transition duration-200">
                <img src="${img}" class="w-full h-48 object-cover" alt="${p.title}">
                <div class="p-5 space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-sky-400 uppercase tracking-wider">${p.area} • ${p.campus_proximity} Proximity</span>
                        ${billsBadge}
                    </div>
                    <h3 class="text-base font-bold text-white leading-snug">${p.title}</h3>
                    <p class="text-xs text-slate-400 line-clamp-2">${p.description || ''}</p>
                    <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <div>
                            <span class="text-lg font-extrabold text-white">£${p.price_pppw.toFixed(2)}</span>
                            <span class="text-xs text-slate-400">pppw</span>
                        </div>
                        <span class="text-xs text-slate-300 font-medium">${p.bedrooms} Beds • ${p.bathrooms} Baths</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    if (window.lucide) lucide.createIcons();
}

// -------------------------------------------------------------
// VIEWINGS LOG
// -------------------------------------------------------------

function loadViewings() {
    const viewings = getStoredBookings();
    renderViewings(viewings);
}

function renderViewings(viewings) {
    const tbody = document.getElementById('viewings-table-body');
    if (!tbody) return;

    if (viewings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-slate-500 text-xs">No viewings booked yet. Run a simulated conversation to book a viewing!</td></tr>`;
        return;
    }

    tbody.innerHTML = viewings.map(v => {
        const dt = new Date(v.scheduled_time);
        const dateStr = dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) + ' at ' + dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        
        let statusBadge = '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Confirmed</span>';
        if (v.status === 'cancelled') {
            statusBadge = '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Cancelled</span>';
        } else if (v.status === 'completed') {
            statusBadge = '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">Completed</span>';
        }

        return `
            <tr class="hover:bg-slate-800/40 transition">
                <td class="px-6 py-4 font-semibold text-white">${v.property ? v.property.title : 'Exeter Student Property'}</td>
                <td class="px-6 py-4">
                    <p class="text-white font-medium">${v.lead_tenant_name}</p>
                    <p class="text-xs text-slate-400">${v.lead_tenant_email} • ${v.lead_tenant_phone}</p>
                </td>
                <td class="px-6 py-4">${v.group_size} Students</td>
                <td class="px-6 py-4 text-sky-400 font-medium">${dateStr}</td>
                <td class="px-6 py-4">${statusBadge}</td>
                <td class="px-6 py-4 text-right space-x-2">
                    ${v.status === 'confirmed' ? `
                        <button onclick="completeViewing('${v.id}')" class="px-2.5 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded text-xs transition">Done</button>
                        <button onclick="cancelViewing('${v.id}')" class="px-2.5 py-1 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 rounded text-xs transition">Cancel</button>
                    ` : '<span class="text-xs text-slate-500">Archived</span>'}
                </td>
            </tr>
        `;
    }).join('');
}

function cancelViewing(id) {
    const list = getStoredBookings();
    const item = list.find(b => b.id === id);
    if (item) item.status = "cancelled";
    localStorage.setItem("lp_viewings", JSON.stringify(list));
    loadViewings();
    loadDashboardStats();
}

function completeViewing(id) {
    const list = getStoredBookings();
    const item = list.find(b => b.id === id);
    if (item) item.status = "completed";
    localStorage.setItem("lp_viewings", JSON.stringify(list));
    loadViewings();
    loadDashboardStats();
}

function copyWidgetCode() {
    const code = `<!-- LettingsPulse Exeter 24/7 AI Lettings Widget -->\n<script src="https://faezehmillerai.github.io/Letting/widget.js" data-agency-slug="cardens-exeter" data-primary-color="#0284c7" defer></script>`;
    navigator.clipboard.writeText(code);
    const btn = document.getElementById('copy-btn');
    btn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i><span>Copied!</span>`;
    if (window.lucide) lucide.createIcons();
    setTimeout(() => {
        btn.innerHTML = `<i data-lucide="copy" class="w-3.5 h-3.5"></i><span>Copy Snippet</span>`;
        if (window.lucide) lucide.createIcons();
    }, 2500);
}
