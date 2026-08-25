(function() {
    // LettingsPulse Exeter Embeddable Student Chat Widget
    const scriptTag = document.currentScript;
    const agencySlug = scriptTag ? scriptTag.getAttribute('data-agency-slug') || 'cardens-exeter' : 'cardens-exeter';
    const primaryColor = scriptTag ? scriptTag.getAttribute('data-primary-color') || '#0284c7' : '#0284c7';

    const container = document.createElement('div');
    container.id = 'lettingspulse-widget-container';
    container.style.position = 'fixed';
    container.style.bottom = '24px';
    container.style.right = '24px';
    container.style.zIndex = '999999';
    container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    const button = document.createElement('button');
    button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: white;">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
    `;
    button.style.width = '56px';
    button.style.height = '56px';
    button.style.borderRadius = '28px';
    button.style.backgroundColor = primaryColor;
    button.style.border = 'none';
    button.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3)';
    button.style.cursor = 'pointer';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.transition = 'transform 0.2s';

    button.onmouseover = () => button.style.transform = 'scale(1.05)';
    button.onmouseout = () => button.style.transform = 'scale(1)';

    const chatBox = document.createElement('div');
    chatBox.style.width = '360px';
    chatBox.style.height = '540px';
    chatBox.style.backgroundColor = '#0f172a';
    chatBox.style.borderRadius = '20px';
    chatBox.style.boxShadow = '0 20px 40px rgba(0,0,0,0.5)';
    chatBox.style.display = 'none';
    chatBox.style.flexDirection = 'column';
    chatBox.style.overflow = 'hidden';
    chatBox.style.marginBottom = '12px';
    chatBox.style.border = '1px solid #334155';

    chatBox.innerHTML = `
        <div style="background: ${primaryColor}; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center;">
            <div style="color: white; font-weight: bold; font-size: 14px;">24/7 Student Accommodation AI</div>
            <button id="lp-close-btn" style="background: transparent; border: none; color: white; cursor: pointer; font-size: 18px;">&times;</button>
        </div>
        <div id="lp-widget-chat" style="flex: 1; padding: 14px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; font-size: 13px; color: #f1f5f9;">
            <div style="background: #1e293b; padding: 10px 12px; border-radius: 12px; max-width: 85%;">
                👋 Hi! Looking for student houses in Exeter? Tell me how many bedrooms your group needs (e.g. 4, 5, 6 beds) and your budget!
            </div>
        </div>
        <div style="padding: 10px; border-top: 1px solid #334155; display: flex; gap: 8px; background: #0f172a;">
            <input type="text" id="lp-widget-input" placeholder="Type message..." style="flex: 1; background: #1e293b; color: white; border: 1px solid #475569; border-radius: 20px; padding: 8px 12px; font-size: 12px; outline: none;">
            <button id="lp-widget-send" style="background: ${primaryColor}; border: none; border-radius: 50%; width: 32px; height: 32px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;">➤</button>
        </div>
    `;

    button.onclick = () => {
        const isHidden = chatBox.style.display === 'none';
        chatBox.style.display = isHidden ? 'flex' : 'none';
    };

    container.appendChild(chatBox);
    container.appendChild(button);
    document.body.appendChild(container);

    const closeBtn = document.getElementById('lp-close-btn');
    if (closeBtn) closeBtn.onclick = () => chatBox.style.display = 'none';
})();
