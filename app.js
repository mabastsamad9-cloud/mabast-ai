/* Mabast AI frontend demo. Connect a trusted server-side AI API before production use. */
const $ = (s) => document.querySelector(s);
const input = $('#promptInput');
const messagesEl = $('#messages');
const welcome = $('#welcome');
const fileInput = $('#fileInput');
const preview = $('#attachmentPreview');
const sendBtn = $('#sendBtn');
let attachments = [];
let chats = JSON.parse(localStorage.getItem('mabast-chats') || '[]');
let activeChatId = null;

function saveChats() { localStorage.setItem('mabast-chats', JSON.stringify(chats)); }
function renderHistory() {
  const list = $('#historyList');
  if (!chats.length) { list.innerHTML = '<div class="empty-history">گفتوگۆکانت لێرە دەردەکەون</div>'; return; }
  list.innerHTML = chats.slice().reverse().map(c => `<div class="history-item ${c.id === activeChatId ? 'active' : ''}" data-id="${c.id}"><span>◷</span><span style="overflow:hidden;text-overflow:ellipsis">${escapeHtml(c.title)}</span></div>`).join('');
  list.querySelectorAll('.history-item').forEach(el => el.addEventListener('click', () => loadChat(el.dataset.id)));
}
function escapeHtml(text) { return String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function setWelcome(show) { welcome.style.display = show ? '' : 'none'; }
function addMessage(role, text, files = []) {
  setWelcome(false);
  const row = document.createElement('div'); row.className = `message ${role}`;
  const avatar = document.createElement('div'); avatar.className = 'message-avatar'; avatar.textContent = role === 'assistant' ? '✦' : 'M';
  const body = document.createElement('div'); body.className = 'message-content'; body.textContent = text;
  files.forEach(file => { const url = URL.createObjectURL(file); const media = document.createElement(file.type.startsWith('video/') ? 'video' : 'img'); media.src = url; if (media.tagName === 'VIDEO') { media.controls = true; media.playsInline = true; } body.appendChild(media); });
  row.append(avatar, body); messagesEl.appendChild(row); $('#conversation').scrollTop = $('#conversation').scrollHeight; return row;
}
function newChat() { activeChatId = null; messagesEl.replaceChildren(); setWelcome(true); renderHistory(); input.focus(); closeSidebar(); }
function loadChat(id) {
  const chat = chats.find(c => c.id === id); if (!chat) return;
  activeChatId = id; messagesEl.replaceChildren(); setWelcome(!chat.messages.length);
  chat.messages.forEach(m => addMessage(m.role, m.text)); renderHistory(); closeSidebar();
}
function updateChat(role, text) {
  if (!activeChatId) { activeChatId = crypto.randomUUID(); chats.push({id:activeChatId,title:text.slice(0,42) || 'گفتوگۆی نوێ',messages:[],updated:Date.now()}); }
  const chat = chats.find(c => c.id === activeChatId); chat.messages.push({role,text}); chat.updated = Date.now(); saveChats(); renderHistory();
}
function renderAttachments() {
  preview.replaceChildren();
  attachments.forEach((file, i) => {
    const chip = document.createElement('div'); chip.className = 'file-chip';
    if (file.type.startsWith('image/')) { const img = document.createElement('img'); img.src = URL.createObjectURL(file); chip.appendChild(img); }
    else { const vid = document.createElement('span'); vid.textContent = '▶'; chip.appendChild(vid); }
    const name = document.createElement('span'); name.textContent = file.name.length > 18 ? file.name.slice(0,15)+'…' : file.name;
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label','لابردنی هاوپێچ'); remove.onclick = () => { attachments.splice(i,1); renderAttachments(); };
    chip.append(name,remove); preview.appendChild(chip);
  });
}
function assistantDemoReply(prompt, files) {
  const text = prompt.toLowerCase();
  if (files.length) return 'سوپاس بۆ ناردنی فایلەکە! لەم وەشانەدا دەتوانیت وێنە و ڤیدیۆ باربکەیت، بەڵام بۆ شیکردنەوەی ناوەڕۆکیان پێویستە خزمەتگوزاریی AI بە API پەیوەست بکرێت.';
  if (/وێنە|image|دروست بکە|بەرهەم بهێنە/.test(text)) return 'بیرۆکەکەت تۆمار کرا. بۆ دروستکردنی وێنە لە ناو چاتەوە، پێویستە خزمەتگوزاریی دروستکردنی وێنە بە API پەیوەست بکرێت. دەتوانیت وەسفی وێنەکەت بنووسیت؛ لە وەشانی ئێستادا ئەم ڕووکارییە نموونەییە.';
  if (/ئەمڕۆ چی|چۆن یارمەت|چی دەتوانیت/.test(text)) return 'دەتوانم یارمەتیت بدەم لە وەڵامدانەوەی پرسیار، نووسین و ڕێکخستنی بیرۆکە، فێربوون، وەرگێڕان و پلاندانان. هەروەها دەتوانیت وێنە یان ڤیدیۆ باربکەیت. بۆ وەڵامی ڕاستەقینەی AI، پێویستە API لە سێرڤەرەوە پەیوەست بکرێت.';
  return 'داواکارییەکەت وەرگیرا. ئەم ڕووکارییە بنەمای چات و مێژووی پارێزراوی Mabast AI ـە؛ بۆ وەڵامدانی ڕاستەقینە، پێویستە مۆدێلی AI بە API ـی پارێزراو لە سێرڤەر پەیوەست بکرێت. تکایە کلیلی API لە کۆدی وێبسایت دانەنێ.';
}
function sendMessage() {
  const text = input.value.trim(); const files = [...attachments]; if (!text && !files.length) return;
  addMessage('user', text || 'فایل نێردرا', files); updateChat('user', text || 'فایل نێردرا');
  input.value = ''; input.style.height = 'auto'; attachments = []; renderAttachments(); sendBtn.disabled = true;
  const typing = document.createElement('div'); typing.className = 'message assistant'; typing.innerHTML = '<div class="message-avatar">✦</div><div class="message-content"><span class="typing"><i></i><i></i><i></i></span></div>'; messagesEl.appendChild(typing); $('#conversation').scrollTop = $('#conversation').scrollHeight;
  setTimeout(() => { typing.remove(); const reply = assistantDemoReply(text, files); addMessage('assistant', reply); updateChat('assistant', reply); sendBtn.disabled = false; input.focus(); }, 650);
}
input.addEventListener('input', () => { input.style.height='auto'; input.style.height=Math.min(input.scrollHeight,150)+'px'; });
input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
sendBtn.addEventListener('click', sendMessage);
$('#newChat').addEventListener('click', newChat);
$('#attachBtn').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => { const valid = [...fileInput.files].filter(f => f.type.startsWith('image/') || f.type.startsWith('video/')); attachments.push(...valid); renderAttachments(); fileInput.value=''; });
document.querySelectorAll('.suggestion').forEach(btn => btn.addEventListener('click', () => { input.value = btn.dataset.prompt; input.focus(); input.dispatchEvent(new Event('input')); }));
$('#themeToggle').addEventListener('click', () => { document.body.classList.toggle('light'); localStorage.setItem('mabast-light', document.body.classList.contains('light')); });
if (localStorage.getItem('mabast-light') === 'true') document.body.classList.add('light');
function closeSidebar() { $('#sidebar').classList.remove('open'); $('#sidebarScrim').classList.remove('show'); }
$('#menuToggle').addEventListener('click', () => { $('#sidebar').classList.add('open'); $('#sidebarScrim').classList.add('show'); });
$('#sidebarScrim').addEventListener('click', closeSidebar);
document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); newChat(); } if (e.key === 'Escape') closeSidebar(); });
renderHistory();
