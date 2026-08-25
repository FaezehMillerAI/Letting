// LettingsPulse Exeter Frontend Application

let currentSenderId = "demo_student_" + Math.floor(Math.random() * 10000);
let allProperties = [];

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
    lucide.createIcons();
}

// -------------------------------------------------------------
// CHAT & SIMULATOR LOGIC
// -------------------------------------------------------------

function initChat() {
    const chatContainer = document.getElementById('chat-messages');
    chatContainer.innerHTML = '';
    
    // Initial welcome message from AI
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

    // Show typing indicator
    const typingId = showTypingIndicator();

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

        const data = await response.json();
        removeTypingIndicator(typingId);

        appendBotMessage(data.reply, data.recommended_properties);

        // If booking confirmed, refresh viewings and dashboard
        if (data.booking_confirmed) {
            loadDashboardStats();
            loadViewings();
        }

    } catch (err) {
        removeTypingIndicator(typingId);
        appendBotMessage("⚠️ Connection error to LettingsPulse backend. Please ensure the local server is running.");
    }
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
            propCardsHtml += `
                <div class="chat-property-card p-2.5 rounded-xl border border-slate-700 bg-slate-900/90 flex space-x-3 items-center">
                    <img src="${p.image_url}" class="w-16 h-16 rounded-lg object-cover flex-shrink-0" alt="property">
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
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Newlines
    html = html.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
    return html;
}

function escapeHtml(string) {
    return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// -------------------------------------------------------------
// DASHBOARD STATS
// -------------------------------------------------------------

async function loadDashboardStats() {
    try {
        const res = await fetch('/api/dashboard/stats');
        const stats = await res.json();

        document.getElementById('stat-total-inquiries').innerText = stats.total_inquiries;
        document.getElementById('stat-qualified-groups').innerText = stats.qualified_groups;
        document.getElementById('stat-booked-viewings').innerText = stats.total_booked_viewings;
        document.getElementById('stat-pipeline-commission').innerText = '£' + stats.estimated_pipeline_commission.toLocaleString();

        renderActivityFeed();
    } catch (e) {
        console.error("Failed to load dashboard stats", e);
    }
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
    lucide.createIcons();
}

// -------------------------------------------------------------
// PROPERTIES INVENTORY
// -------------------------------------------------------------

async function loadProperties() {
    try {
        const res = await fetch('/api/properties');
        allProperties = await res.json();
        renderProperties(allProperties);
    } catch (e) {
        console.error("Failed to load properties", e);
    }
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

        return `
            <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-sky-500/50 transition duration-200">
                <img src="${p.image_urls[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'}" class="w-full h-48 object-cover" alt="${p.title}">
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
    lucide.createIcons();
}

// -------------------------------------------------------------
// VIEWINGS LOG
// -------------------------------------------------------------

async function loadViewings() {
    try {
        const res = await fetch('/api/viewings');
        const viewings = await res.json();
        renderViewings(viewings);
    } catch (e) {
        console.error("Failed to load viewings", e);
    }
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

async function cancelViewing(id) {
    await fetch(`/api/viewings/${id}/cancel`, { method: 'POST' });
    loadViewings();
    loadDashboardStats();
}

async function completeViewing(id) {
    await fetch(`/api/viewings/${id}/complete`, { method: 'POST' });
    loadViewings();
    loadDashboardStats();
}

function copyWidgetCode() {
    const code = `<!-- LettingsPulse Exeter 24/7 AI Lettings Widget -->\n<script src="http://localhost:8000/static/widget.js" data-agency-slug="cardens-exeter" data-primary-color="#0284c7" defer></script>`;
    navigator.clipboard.writeText(code);
    const btn = document.getElementById('copy-btn');
    btn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i><span>Copied!</span>`;
    lucide.createIcons();
    setTimeout(() => {
        btn.innerHTML = `<i data-lucide="copy" class="w-3.5 h-3.5"></i><span>Copy Snippet</span>`;
        lucide.createIcons();
    }, 2500);
}
