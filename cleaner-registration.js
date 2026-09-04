(function () {
  const copyButton = document.querySelector('#copyCleanerRegistration');
  const applicationsArea = document.querySelector('#cleanerApplications');
  const accessKey = () => sessionStorage.getItem('cleanlyAdminApplicationsKey') || '';
  const adminHeaders = () => ({ 'Content-Type': 'application/json', 'x-admin-applications-key': accessKey() });
  const initials = name => name.trim().split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  const availabilitySummary = availability => Object.entries(availability).map(([day, hours]) => `${day.slice(0, 3)} ${hours[0]}–${hours[1]}`).join(' · ');

  copyButton?.addEventListener('click', async () => {
    const link = 'https://t.me/cleanly_perth_bot?start=register';
    try { await navigator.clipboard.writeText(link); showAddToast('Telegram link copied', 'Send this link to cleaners so they can register with the bot.'); }
    catch { window.prompt('Copy this cleaner registration link:', link); }
  });

  function render(applications) {
    const pending = applications.filter(application => application.status === 'pending');
    if (!pending.length) { applicationsArea.innerHTML = ''; return; }
    applicationsArea.innerHTML = `<p class="eyebrow">NEW APPLICATIONS</p>${pending.map(application => `<article class="application-card" data-id="${application.id}"><div class="application-main"><h3>${application.name}</h3><p>${application.phone} · ABN ${application.abn}</p><p class="availability-summary">${availabilitySummary(application.availability)}</p></div><div class="application-actions"><label>Rate $/h <input type="number" min="0" step="0.01" placeholder="32.00" /></label><button type="button">Approve & add</button></div></article>`).join('')}`;
    applicationsArea.querySelectorAll('.application-card button').forEach(button => button.addEventListener('click', () => approve(button.closest('.application-card'), applications)));
  }

  async function approve(card, applications) {
    const rate = Number(card.querySelector('input').value);
    if (!rate) { card.querySelector('input').focus(); return; }
    const application = applications.find(item => item.id === card.dataset.id);
    const button = card.querySelector('button'); button.disabled = true; button.textContent = 'Adding…';
    try {
      const response = await fetch('/api/cleaner-applications', { method: 'POST', headers: adminHeaders(), body: JSON.stringify({ action: 'approve', id: application.id, rate }) });
      const result = await response.json(); if (!response.ok || !result.ok) throw new Error(result.error || 'Unable to approve application.');
      const index = team.length;
      team.push([initials(application.name), application.name, 'Cleaner', 'Available', '0h this week']);
      teamAbns.push(application.abn); teamProfiles.push({ phone: application.phone, rate, telegram: Boolean(application.telegramChatId), chatId: application.telegramChatId || '', availability: application.availability });
      const grid = document.querySelector('#teamGrid'); if (grid.querySelector('.empty-state')) grid.innerHTML = '';
      const teamCard = document.createElement('article'); teamCard.className = 'team-card';
      teamCard.innerHTML = `${avatar(initials(application.name), index)}<button class="edit-button card-edit edit-team" data-index="${index}">Edit</button><h3>${application.name}</h3><p>Cleaner</p><footer><span>● Available</span><span>$${rate.toFixed(2)}/h</span></footer><button class="delete-button">Delete</button>`;
      grid.append(teamCard); teamCard.querySelector('.delete-button').onclick = () => teamCard.remove();
      teamCard.querySelector('.edit-team').onclick = () => openEditor('team', index);
      render(applications.map(item => item.id === application.id ? result.application : item));
      showAddToast('Cleaner approved', `${application.name} has been added to your team.`);
    } catch (error) { button.disabled = false; button.textContent = 'Approve & add'; showAddToast('Could not approve', error.message); }
  }

  async function load() {
    let key = accessKey();
    if (!key) { key = window.prompt('Enter the administrator applications key to view new cleaner registrations:') || ''; if (!key) return; sessionStorage.setItem('cleanlyAdminApplicationsKey', key); }
    try {
      const response = await fetch('/api/cleaner-applications', { headers: { 'x-admin-applications-key': key } });
      const result = await response.json();
      if (response.status === 401) { sessionStorage.removeItem('cleanlyAdminApplicationsKey'); showAddToast('Access key required', 'Enter the administrator applications key again by reopening Team.'); return; }
      if (response.ok && result.ok) render(result.applications);
    } catch (_) { /* The public registration feature becomes active after Vercel KV is configured. */ }
  }
  document.querySelectorAll('[data-view="team"]').forEach(link => link.addEventListener('click', load));
}());
