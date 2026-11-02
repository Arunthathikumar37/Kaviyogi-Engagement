(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const openingScreen = $('#openingScreen');
  const openButton = $('#openInvitation');
  const mainContent = $('#invitationContent');
  const scratchCard = $('#scratchCard');
  const scratchCanvas = $('#scratchCanvas');
  const scratchInstruction = $('#scratchInstruction');
  const revealedDate = $('#revealedDate');
  const rsvpForm = $('#rsvpForm');
  const backgroundMusic = $('#backgroundMusic');
  let currentLanguage = 'en';
  let toastTimer = null;
  let musicActive = false;
  let submissionInFlight = false;
  let requestKey = getRequestKey();
  let guestCount = 1;
  let scratchContext = null;
  let scratchWidth = 0;
  let scratchHeight = 0;
  let scratchDpr = 1;
  let isScratching = false;
  let scratchMoves = 0;
  let dateRevealed = false;
  let jasmineCreated = false;
  let reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const WEDDING_DATE = new Date('2026-11-15T09:00:00+05:30');
  const VENUE_NAME = 'Bajanai Kovil';
  const VENUE_ADDRESS = 'Issukkazhi, Katteri, Thiruvannamalai District';
  const MAP_URL = 'https://www.google.com/maps/search/?api=1&query=Bajanai+Kovil+Issukkazhi+Katteri+Thiruvannamalai';
  const SCRATCH_REVEAL_THRESHOLD = 0.75;
  // Public Apps Script endpoint accepts new RSVP rows; the connected spreadsheet stays private.
  const GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwQJSz6AsZmydlI31o_LFmOHJkWiforfcWzSHhB7B6djySRjK470LebH1uN18iws26k/exec';

  const translations = {
    en: {
      openingMantra:'Aum · Sivamayam', openingEyebrow:'Together with our families', clickToOpen:'CLICK TO OPEN', openingBottom:'A joyful engagement, blessed by tradition',
      sectionOneEyebrow:'Together with our families', sectionOneTitle:'Our Engagement Celebration', familyBlessing:'With the blessings of our elders, we joyfully invite you to our engagement.', groomSide:'The beloved son of', brideSide:'The beloved daughter of', scrollExplore:'SCROLL TO EXPLORE',
      dateEyebrow:'A moment to remember', dateTitle:'Our Engagement Date', dateIntro:'Gently scratch the golden surface to reveal our engagement day.', revealedKicker:'PLEASE SAVE THE DATE', dateMain:'15 November 2026', dateWeekday:'Sunday', dateMuhurtham:'Auspicious time · 9:00 AM – 11:00 AM', scratchToReveal:'SCRATCH HERE', scratchHint:'Use your finger or mouse', tapReveal:'Tap to reveal instead', countdownTitle:'Our Engagement In', days:'Days', hours:'Hours', minutes:'Minutes', seconds:'Seconds', countdownFootnote:'',
      venueEyebrow:'Join us for the celebration', venueTitle:'Engagement Venue & Directions', venueName:'Bajanai Kovil', venueAddress:'Issukkazhi, Katteri,<br />Thiruvannamalai District', weddingDateLabel:'Engagement date', weddingDateValue:'Sunday, 15 November 2026', muhurthamLabel:'Auspicious time', lunchLabel:'Occasion', lunchValue:'Engagement ceremony', openMap:'OPEN MAP', addCalendar:'ADD TO CALENDAR', venueNote:'We look forward to celebrating this blessed engagement with you.',
      rsvpEyebrow:'Your presence is a blessing', rsvpTitle:'Guest Wishes and Message', rsvpIntro:"Please let us know if you'll be joining us, and leave a wish if you cannot attend.", guestNameLabel:'Name of the person <span class="required-star">*</span>', guestNamePlaceholder:'Enter your name', attendingQuestion:'Will you be attending? <span class="required-star">*</span>', attendYes:"Yes, I'll attend", attendNo:"No, I can't attend", guestCountLabel:'How many guests will attend, including you? <span class="required-star">*</span>', guestCountHint:'Including you · Maximum 10 guests', guestMessageLabel:'Send us a message or your wishes <span class="optional-label">(optional)</span>', guestMessagePlaceholder:'Write a message for the couple…', submitRsvp:'SUBMIT RSVP', privacyNote:'Your response and message are private and will only be visible to the couple.', familyAdmin:'Family access · Admin',
      shareTitle:'Share Our Joy', shareIntro:'Help us share this special day with family and friends.', shareWhatsApp:'SHARE ON WHATSAPP', copyLink:'COPY INVITATION LINK', scanToOpen:'Scan to open the invitation', qrNote:'Once published, this QR code will point to the live website address.', openQr:'Open QR code to save', footerBlessing:'With love, Murugan & Kaviyam', footerTitle:'With Love', madeWithLove:'Made with love', musicOn:'MUSIC · ON', musicOff:'MUSIC · OFF',
      formRequired:'Please enter your name and select your attendance.', countRequired:'Please choose a guest count from 1 to 10.', submitFailed:'We could not save your response just now. Please check your connection and try again.', rsvpStorageSetupTitle:'RSVP storage is not connected yet.', rsvpStorageSetupDesc:'Your response was not saved. Please contact the couple so they can finish setting up private storage.', rsvpServiceUnavailable:'The RSVP service is temporarily unavailable. Your response was not saved; please try again later.',
      thankAttend:'Thank you for confirming, {name}! We look forward to welcoming you and your guests to Serendib Grand, Colombo 10.', thankNotAttend:'Thank you, {name}. We will miss you!', thankMessage:'Thank you for your lovely message and wishes.', savedTitle:'Your response has been recorded', thanksClose:'CLOSE',
      musicFailed:'The background music could not be loaded. Please check your connection and try again.', linkCopied:'Invitation link copied.', copyFailed:'Copy failed. You can copy the website link from your browser address bar.', calendarReady:'Your calendar event is ready.', qrPreview:'The QR code will point to the published website address. Deploy this project to Vercel to create the guest-ready QR code.', revealDone:'The engagement date is revealed!', weddingPassed:'The auspicious time has begun — today is your special day!', weddingComplete:'With gratitude, thank you for celebrating our engagement.', adminSetup:'Admin access is not configured yet. Set ADMIN_PASSWORD and SESSION_SECRET in Vercel project settings, then redeploy.'
    },
    ta: {
      openingMantra:'ஓம் · சிவமயம்', openingEyebrow:'எங்கள் குடும்பத்தினருடன்', clickToOpen:'அழைப்பிதழைத் திறக்கவும்', openingBottom:'மரபின் ஆசீர்வாதத்துடன் ஒரு அழகான தொடக்கம்',
      sectionOneEyebrow:'எங்கள் குடும்பத்துடன்', sectionOneTitle:'எங்கள் நிச்சயதார்த்த விழா', familyBlessing:'மூத்தோரின் ஆசீர்வாதத்துடன், எங்கள் நிச்சயதார்த்தத்திற்கு உங்களை அன்புடன் அழைக்கின்றோம்.', groomSide:'அன்பு மகன்', brideSide:'அன்பு மகள்', scrollExplore:'கீழே தொடரவும்',
      dateEyebrow:'நினைவில் நிற்கும் தருணம்', dateTitle:'எங்கள் நிச்சயதார்த்த நாள்', dateIntro:'தங்க நிற அட்டையை மெதுவாகச் சுரண்டி எங்கள் நிச்சயதார்த்த நாளைக் காணுங்கள்.', revealedKicker:'இந்த நாளைக் குறித்து வைத்துக்கொள்ளுங்கள்', dateMain:'15 நவம்பர் 2026', dateWeekday:'ஞாயிற்றுக்கிழமை', dateMuhurtham:'முகூர்த்த நேரம் · காலை 9:00 – 11:00', scratchToReveal:'இங்கே சுரண்டவும்', scratchHint:'விரல் அல்லது மவுஸ் பயன்படுத்தவும்', tapReveal:'திறக்க இங்கே தட்டவும்', countdownTitle:'நிச்சயதார்த்தத்திற்கு இன்னும்', days:'நாட்கள்', hours:'மணி', minutes:'நிமிடங்கள்', seconds:'விநாடிகள்', countdownFootnote:'',
      venueEyebrow:'நிச்சயதார்த்த விழாவில் கலந்து கொண்டு மகிழுங்கள்', venueTitle:'நிச்சயதார்த்த இடம் மற்றும் வழித்தடம்', venueName:'பஜனை கோவில்', venueAddress:'ஈசுக்கழி, கட்டேரி,<br />திருவஅண்ணாமலை மாவட்டம்', weddingDateLabel:'நிச்சயதார்த்த நாள்', weddingDateValue:'ஞாயிற்றுக்கிழமை, 15 நவம்பர் 2026', muhurthamLabel:'முகூர்த்த நேரம்', lunchLabel:'விழா', lunchValue:'நிச்சயதார்த்த விழா', openMap:'வரைபடத்தைத் திறக்கவும்', addCalendar:'நாள்காட்டியில் சேர்க்கவும்', venueNote:'நிச்சயதார்த்த விழாவில் உங்களுடன் மகிழ்ந்து கொண்டாட ஆவலுடன் இருக்கிறோம்.',
      rsvpEyebrow:'உங்கள் வருகையே எங்களுக்கு ஆசீர்வாதம்', rsvpTitle:'விருந்தினர் வாழ்த்துகள் மற்றும் செய்திகள்', rsvpIntro:'நீங்கள் வருகை தருகிறீர்களா என்பதைத் தெரிவிக்கவும். வர இயலாவிட்டால் உங்கள் வாழ்த்துகளைப் பகிரலாம்.', guestNameLabel:'நபரின் பெயர் <span class="required-star">*</span>', guestNamePlaceholder:'உங்கள் பெயரை உள்ளிடவும்', attendingQuestion:'நீங்கள் திருமணத்திற்கு வருகை தருவீர்களா? <span class="required-star">*</span>', attendYes:'ஆம், வருகை தருவேன்', attendNo:'இல்லை, வர இயலாது', guestCountLabel:'உங்களையும் சேர்த்து எத்தனை பேர் வருகை தருவீர்கள்? <span class="required-star">*</span>', guestCountHint:'உங்களையும் சேர்த்து · அதிகபட்சம் 10 பேர்', guestMessageLabel:'செய்தி அல்லது வாழ்த்துகளை அனுப்பவும் <span class="optional-label">(விருப்பம்)</span>', guestMessagePlaceholder:'மணமக்களுக்கு ஒரு செய்தியை எழுதுங்கள்…', submitRsvp:'பதிலைச் சமர்ப்பிக்கவும்', privacyNote:'உங்கள் பதிலும் செய்தியும் தனிப்பட்டவை; மணமக்கள் மட்டுமே அவற்றைப் பார்க்க முடியும்.', familyAdmin:'குடும்ப அணுகல் · நிர்வாகம்',
      shareTitle:'எங்கள் மகிழ்வைப் பகிருங்கள்', shareIntro:'இந்தச் சிறப்பு நாளை குடும்பத்தினர் மற்றும் நண்பர்களுடன் பகிருங்கள்.', shareWhatsApp:'வாட்ஸ்அப்பில் பகிரவும்', copyLink:'அழைப்பிதழ் இணைப்பை நகலெடுக்கவும்', scanToOpen:'அழைப்பிதழைத் திறக்க ஸ்கேன் செய்யவும்', qrNote:'வெளியிடப்பட்டதும், இந்த QR குறியீடு நேரடி இணையதளத்தைத் திறக்கும்.', openQr:'சேமிக்க QR குறியீட்டைத் திறக்கவும்', footerBlessing:'அன்புடன், முருகன் & கவியம்', footerTitle:'அன்புடன்', madeWithLove:'அன்புடன் உருவாக்கப்பட்டது', musicOn:'இசை · இயங்குகிறது', musicOff:'இசை · நிறுத்தப்பட்டது',
      formRequired:'உங்கள் பெயரை உள்ளிட்டு வருகை நிலையைத் தேர்ந்தெடுக்கவும்.', countRequired:'1 முதல் 10 வரை விருந்தினர் எண்ணிக்கையைத் தேர்ந்தெடுக்கவும்.', submitFailed:'உங்கள் பதிலை இப்போது சேமிக்க முடியவில்லை. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.', rsvpStorageSetupTitle:'விருந்தினர் பதில்களைச் சேமிக்கும் வசதி இன்னும் இணைக்கப்படவில்லை.', rsvpStorageSetupDesc:'உங்கள் பதில் சேமிக்கப்படவில்லை. தனிப்பட்ட சேமிப்பை அமைக்க மணமக்களைத் தொடர்புகொள்ளவும்.', rsvpServiceUnavailable:'பதில் அனுப்பும் சேவை தற்காலிகமாக கிடைக்கவில்லை. உங்கள் பதில் சேமிக்கப்படவில்லை; பின்னர் மீண்டும் முயற்சிக்கவும்.',
      thankAttend:'{name}, வருகையை உறுதிப்படுத்தியதற்கு நன்றி! Serendib Grand, Colombo 10-இல் உங்களையும் உங்கள் விருந்தினர்களையும் வரவேற்க ஆவலாக உள்ளோம்.', thankNotAttend:'{name}, நன்றி. நீங்கள் வராதது எங்களுக்கு வருத்தமாக இருக்கும்!', thankMessage:'உங்கள் அன்பான செய்திக்கும் வாழ்த்துகளுக்கும் நன்றி.', savedTitle:'உங்கள் பதில் பதிவு செய்யப்பட்டது', thanksClose:'மூடவும்',
      musicFailed:'பின்னணி இசையை இயக்க முடியவில்லை. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.', linkCopied:'அழைப்பிதழ் இணைப்பு நகலெடுக்கப்பட்டது.', copyFailed:'நகலெடுக்க முடியவில்லை. உலாவியின் முகவரிப் பட்டியிலிருந்து இணைய இணைப்பை நகலெடுக்கலாம்.', calendarReady:'நாள்காட்டி நிகழ்வு தயார்.', qrPreview:'QR குறியீடு நேரடி இணையதள முகவரியைத் திறக்கும். விருந்தினர்களுக்கான QR குறியீட்டை உருவாக்க Vercel-இல் வெளியிடவும்.', revealDone:'நிச்சயதார்த்த தேதி வெளிப்பட்டது!', weddingPassed:'மங்கள நேரம் தொடங்கிவிட்டது — இன்று உங்கள் சிறப்பு நாள்!', weddingComplete:'எங்கள் நிச்சயதார்த்தத்தைக் கொண்டாடியதற்கு மனமார்ந்த நன்றி.', adminSetup:'நிர்வாக அணுகல் இன்னும் அமைக்கப்படவில்லை. Vercel திட்ட அமைப்புகளில் ADMIN_PASSWORD மற்றும் SESSION_SECRET அமைத்து மீண்டும் வெளியிடவும்.'
    }
  };

  const nameTranslations = {
    en: {groom:'Murugan', groomNick:'(Yokesh)', bride:'Kaviyam', brideNick:'(Kaviya)', groomParents:'Mr. Elumalai & Mrs. Dhanalakshmi', brideParents:'Mr. Shanmugam & Mrs. Nalini'},
    ta: {groom:'முருகன்', groomNick:'(யோகேஷ்)', bride:'கவியம்', brideNick:'(கவியா)', groomParents:'திரு. எழுமலை · திருமதி. தனலக்ஷ்மி', brideParents:'திரு. சன்முகம் · திருமதி. நலிநி'}
  };

  function t(key) { return (translations[currentLanguage] && translations[currentLanguage][key]) || translations.en[key] || key; }

  function setLanguage(language) {
    const restoreScrollY = document.body.classList.contains('invitation-open') ? window.scrollY : null;
    currentLanguage = language === 'ta' ? 'ta' : 'en';
    document.documentElement.lang = currentLanguage;
    document.body.classList.toggle('ta', currentLanguage === 'ta');
    $$('.language-toggle .lang-en').forEach(el => el.classList.toggle('active-lang', currentLanguage === 'en'));
    $$('.language-toggle .lang-ta').forEach(el => el.classList.toggle('active-lang', currentLanguage === 'ta'));
    $$('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (translations[currentLanguage][key] !== undefined) el.innerHTML = translations[currentLanguage][key];
    });
    $$('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (translations[currentLanguage][key] !== undefined) el.placeholder = translations[currentLanguage][key];
    });
    const names = nameTranslations[currentLanguage];
    $('#openingGroom').textContent = names.groom;
    $('#openingBride').textContent = names.bride;
    $('#sectionGroom').textContent = names.groom;
    $('#sectionGroomNick').textContent = names.groomNick;
    $('#sectionBride').textContent = names.bride;
    $('#sectionBrideNick').textContent = names.brideNick;
    $('#groomParents').textContent = names.groomParents;
    $('#brideParents').textContent = names.brideParents;
    const groomTamilDesignation = $('#groomTamilDesignation');
    const groomTamilHonorific = $('#groomTamilHonorific');
    const brideTamilDesignation = $('#brideTamilDesignation');
    const brideTamilHonorific = $('#brideTamilHonorific');
    if (groomTamilDesignation) groomTamilDesignation.hidden = currentLanguage !== 'ta';
    if (groomTamilHonorific) groomTamilHonorific.hidden = currentLanguage !== 'ta';
    if (brideTamilDesignation) brideTamilDesignation.hidden = currentLanguage !== 'ta';
    if (brideTamilHonorific) brideTamilHonorific.hidden = currentLanguage !== 'ta';
    const footerGroom = $('#footerGroomName');
    const footerBride = $('#footerBrideName');
    if (footerGroom) footerGroom.textContent = names.groom;
    if (footerBride) footerBride.textContent = names.bride;
    const mapLink = $('#openMapLink');
    if (mapLink) mapLink.href = MAP_URL;
    $('#musicToggle .music-label').textContent = t(musicActive ? 'musicOn' : 'musicOff');
    if (!dateRevealed && scratchMoves === 0) drawScratchSurface();
    updateCountdown();
    if (restoreScrollY !== null) {
      requestAnimationFrame(() => window.scrollTo({ top: restoreScrollY, behavior: 'auto' }));
    }
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3400);
  }

  // A fresh idempotency key per page load prevents a prior RSVP in this browser
  // from suppressing a later guest's submission. Retries within the same page
  // reuse the key so a network retry cannot create duplicate rows.
  function getRequestKey() {
    return (window.crypto && typeof crypto.randomUUID === 'function')
      ? crypto.randomUUID()
      : `sk-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  }

  // Opening split animation and white fade. Music is attempted only after this user gesture.
  openButton.addEventListener('click', () => {
    if (openingScreen.classList.contains('is-opening')) return;
    openingScreen.classList.add('is-opening');
    mainContent.setAttribute('aria-hidden', 'false');
    mainContent.inert = false;
    // Trigger sound only from this click, but do not block the visual transition on network audio.
    attemptMusicPlayback(false);
    const wait = reduceMotion ? 80 : 1450;
    window.setTimeout(() => {
      openingScreen.classList.add('is-hidden');
      document.body.classList.remove('intro-lock');
      document.body.classList.add('invitation-open');
      window.scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'});
      openingScreen.setAttribute('aria-hidden','true');
      createJasmine();
      createGlobalPetals();
    }, wait);
  });

  // The language switch affects every authored text region.
  $('#languageToggle').addEventListener('click', () => setLanguage(currentLanguage === 'en' ? 'ta' : 'en'));

  // Keep the shared couple cutout visible through the invitation, with a compact size in the footer.
  const footerSectionForImage = $('#shareSection');
  if (footerSectionForImage && 'IntersectionObserver' in window) {
    const footerImageObserver = new IntersectionObserver((entries) => {
      const footerVisible = entries.some((entry) => entry.isIntersecting);
      document.body.classList.toggle('footer-in-view', footerVisible);
    }, { threshold: 0.02 });
    footerImageObserver.observe(footerSectionForImage);
  }

  // Persistent music controls. Audio playback will only be attempted after a direct user action.
  backgroundMusic.volume = 0.22;
  async function attemptMusicPlayback(showErrors = true) {
    try {
      await backgroundMusic.play();
      musicActive = true;
      $('#musicToggle').classList.add('is-playing');
      $('#musicToggle').setAttribute('aria-pressed','true');
      $('#musicToggle').setAttribute('aria-label', currentLanguage === 'en' ? 'Turn background music off' : 'பின்னணி இசையை நிறுத்தவும்');
      $('#musicToggle .music-label').textContent = t('musicOn');
      return true;
    } catch (err) {
      musicActive = false;
      $('#musicToggle').classList.remove('is-playing');
      $('#musicToggle').setAttribute('aria-pressed','false');
      $('#musicToggle .music-label').textContent = t('musicOff');
      if (showErrors) showToast(t('musicFailed'));
      return false;
    }
  }
  $('#musicToggle').addEventListener('click', async () => {
    if (musicActive) {
      backgroundMusic.pause();
      musicActive = false;
      $('#musicToggle').classList.remove('is-playing');
      $('#musicToggle').setAttribute('aria-pressed','false');
      $('#musicToggle').setAttribute('aria-label', currentLanguage === 'en' ? 'Turn background music on' : 'பின்னணி இசையை இயக்கவும்');
      $('#musicToggle .music-label').textContent = t('musicOff');
    } else {
      await attemptMusicPlayback(true);
    }
  });
  backgroundMusic.addEventListener('pause', () => {
    if (!backgroundMusic.ended) {
      musicActive = false;
      $('#musicToggle').classList.remove('is-playing');
      $('#musicToggle').setAttribute('aria-pressed','false');
      $('#musicToggle .music-label').textContent = t('musicOff');
    }
  });

  // Honor the visitor's device-level reduced-motion preference without a visible toggle.
  document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  if (!reduceMotion) createOpeningRice();

  function createOpeningRice() {
    const layer = $('#openingRiceLayer');
    if (!layer || reduceMotion || layer.dataset.created === 'true') return;
    layer.dataset.created = 'true';
    const count = window.innerWidth < 620 ? 28 : 44;
    for (let i = 0; i < count; i++) {
      const grain = document.createElement('span');
      grain.className = 'opening-rice-grain';
      grain.style.left = `${Math.random() * 100}%`;
      grain.style.setProperty('--grain-width', `${2 + Math.random() * 2.1}px`);
      grain.style.setProperty('--grain-height', `${5 + Math.random() * 6}px`);
      grain.style.setProperty('--rot', `${Math.round(Math.random() * 150)}deg`);
      grain.style.setProperty('--drift', `${Math.round((Math.random() - .5) * 95)}px`);
      grain.style.animationDuration = `${6.5 + Math.random() * 5.5}s`;
      grain.style.animationDelay = `${-Math.random() * 11}s`;
      layer.appendChild(grain);
    }
  }

  function createJasmine() { /* replaced by invitation-wide white petals */ }
  let globalPetalsCreated = false;
  function createGlobalPetals() {
    if (globalPetalsCreated || reduceMotion) return;
    globalPetalsCreated = true;
    const layer = $('#globalPetals');
    if (!layer) return;
    const count = window.innerWidth < 620 ? 18 : 30;
    for (let i=0;i<count;i++) {
      const petal = document.createElement('span');
      petal.className = 'white-petal';
      petal.textContent = ['❀','✿','❁'][i%3];
      petal.style.left = `${Math.random()*100}%`;
      petal.style.fontSize = `${10+Math.random()*11}px`;
      petal.style.setProperty('--drift', `${Math.round((Math.random()-.5)*140)}px`);
      petal.style.animationDuration = `${14+Math.random()*15}s`;
      petal.style.animationDelay = `${-Math.random()*24}s`;
      layer.appendChild(petal);
    }
  }

  // Draw a richly textured gold foil surface on the scratch card.
  function drawScratchSurface() {
    if (!scratchCanvas || dateRevealed) return;
    const rect = scratchCanvas.getBoundingClientRect();
    if (rect.width < 5 || rect.height < 5) return;
    scratchDpr = Math.min(window.devicePixelRatio || 1, 2);
    scratchWidth = rect.width;
    scratchHeight = rect.height;
    scratchCanvas.width = Math.floor(rect.width*scratchDpr);
    scratchCanvas.height = Math.floor(rect.height*scratchDpr);
    scratchContext = scratchCanvas.getContext('2d', {willReadFrequently:true});
    scratchContext.setTransform(scratchDpr,0,0,scratchDpr,0,0);
    const ctx = scratchContext;
    const gradient = ctx.createLinearGradient(0,0,rect.width,rect.height);
    gradient.addColorStop(0,'#f3d779'); gradient.addColorStop(.16,'#a96d1c'); gradient.addColorStop(.34,'#f8e5a2'); gradient.addColorStop(.51,'#d29a32'); gradient.addColorStop(.7,'#9a5d17'); gradient.addColorStop(.88,'#efd178'); gradient.addColorStop(1,'#c18425');
    ctx.fillStyle = gradient; ctx.fillRect(0,0,rect.width,rect.height);
    // soft foil flecks
    for (let i=0;i<180;i++) {
      ctx.globalCompositeOperation='source-over';
      ctx.fillStyle = i%3===0 ? 'rgba(255,250,200,.35)' : 'rgba(104,56,11,.12)';
      const x = Math.random()*rect.width, y = Math.random()*rect.height;
      ctx.fillRect(x,y,.6+Math.random()*1.7,.6+Math.random()*2.3);
    }
    ctx.strokeStyle='rgba(255,244,197,.78)'; ctx.lineWidth=1;
    ctx.strokeRect(10,10,rect.width-20,rect.height-20);
    // Keep the gold foil itself clean; the single HTML label above it says SCRATCH HERE.
    // This prevents the old duplicate instruction from being baked into the foil.
  }

  function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(/\s+/); const lines=[]; let line='';
    for(const word of words){const test=line?`${line} ${word}`:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;}
    if(line)lines.push(line); const start=y-((lines.length-1)*lineHeight)/2; lines.forEach((part,i)=>ctx.fillText(part,x,start+i*lineHeight));
  }
  function scratchPoint(event) {
    const rect=scratchCanvas.getBoundingClientRect();
    return {x:event.clientX-rect.left,y:event.clientY-rect.top};
  }
  let lastScratchPoint = null;
  function scratchAt(point) {
    if (dateRevealed || !scratchContext) return;
    scratchMoves++;
    if (scratchInstruction && !scratchInstruction.classList.contains('is-scratching')) scratchInstruction.classList.add('is-scratching');
    const ctx=scratchContext;
    ctx.globalCompositeOperation='destination-out';
    // A thick, rounded line between pointer positions avoids tiny gaps on mobile touch screens.
    ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=22;
    if (lastScratchPoint) {
      ctx.beginPath();ctx.moveTo(lastScratchPoint.x,lastScratchPoint.y);ctx.lineTo(point.x,point.y);ctx.stroke();
    }
    ctx.beginPath();ctx.arc(point.x,point.y,11,0,Math.PI*2);ctx.fill();
    lastScratchPoint = point;
    if (scratchMoves >= 3 && scratchMoves % 4 === 0 && getScratchProgress() >= SCRATCH_REVEAL_THRESHOLD) revealWeddingDate();
  }
  function getScratchProgress() {
    if (!scratchContext || scratchCanvas.width===0) return 0;
    try {
      const data=scratchContext.getImageData(0,0,scratchCanvas.width,scratchCanvas.height).data;
      const step=16; let sampled=0, cleared=0;
      for(let y=3;y<scratchCanvas.height;y+=step){for(let x=3;x<scratchCanvas.width;x+=step){const alpha=data[(y*scratchCanvas.width+x)*4+3];sampled++;if(alpha<90)cleared++;}}
      return sampled ? cleared/sampled : 0;
    }catch(_){return 0;}
  }
  scratchCanvas.addEventListener('pointerdown',event=>{
    if(dateRevealed)return;isScratching=true;lastScratchPoint=null;scratchCanvas.setPointerCapture?.(event.pointerId);scratchAt(scratchPoint(event));event.preventDefault();
  });
  scratchCanvas.addEventListener('pointermove',event=>{if(!isScratching||dateRevealed)return;scratchAt(scratchPoint(event));event.preventDefault();});
  ['pointerup','pointercancel','lostpointercapture'].forEach(name=>scratchCanvas.addEventListener(name,()=>{isScratching=false;lastScratchPoint=null;if(!dateRevealed&&getScratchProgress()>=SCRATCH_REVEAL_THRESHOLD)revealWeddingDate();}));
  // Optional fallback control: some versions omit the button, so never let a missing node stop the app.
  const revealDateButton = $('#revealDateButton');
  if (revealDateButton) revealDateButton.addEventListener('click',revealWeddingDate);
  function revealWeddingDate() {
    if(dateRevealed)return;
    dateRevealed=true;
    scratchCard.classList.add('is-revealed');
    scratchCanvas.style.display='none';
    scratchInstruction.style.display='none';
    if (revealDateButton) revealDateButton.style.display='none';
    runRiceBurst();
  }
  function runRiceBurst() {
    const layer=$('#riceLayer');layer.replaceChildren();
    // Temporarily move the grain layer to the viewport so the rice falls from the top of the screen,
    // even if the guest scratched the card after scrolling partway down the section.
    if (layer.parentElement !== document.body) document.body.appendChild(layer);
    layer.classList.add('rice-viewport-burst');
    const count=220;
    for(let i=0;i<count;i++){
      const grain=document.createElement('span');grain.className='rice-grain';
      grain.style.setProperty('--x',`${Math.random()*100}%`);
      grain.style.setProperty('--w',`${7+Math.random()*5}px`);
      grain.style.setProperty('--h',`${15+Math.random()*12}px`);
      grain.style.setProperty('--dur',`${2.8+Math.random()*2.5}s`);
      grain.style.setProperty('--delay',`${Math.random()*1.1}s`);
      grain.style.setProperty('--rot',`${Math.round(Math.random()*170)}deg`);
      grain.style.setProperty('--drift',`${Math.round((Math.random()-.5)*180)}px`);
      layer.appendChild(grain);
      setTimeout(()=>grain.remove(),6800);
    }
    setTimeout(()=>{
      layer.replaceChildren();layer.classList.remove('rice-viewport-burst');
      const section=$('#section2');if(layer.parentElement!==section)section.appendChild(layer);
    },7100);
  }
  window.addEventListener('resize',()=>{if(!dateRevealed&&scratchMoves===0)drawScratchSurface();});

  function updateCountdown() {
    const delta=WEDDING_DATE.getTime()-Date.now();
    if(delta<=0){
      $('#countDays').textContent='00';$('#countHours').textContent='00';$('#countMinutes').textContent='00';$('#countSeconds').textContent='00';
      $('.countdown-footnote').textContent= '';return;
    }
    const totalSeconds=Math.floor(delta/1000);
    $('#countDays').textContent=String(Math.floor(totalSeconds/86400)).padStart(2,'0');
    $('#countHours').textContent=String(Math.floor((totalSeconds%86400)/3600)).padStart(2,'0');
    $('#countMinutes').textContent=String(Math.floor((totalSeconds%3600)/60)).padStart(2,'0');
    $('#countSeconds').textContent=String(totalSeconds%60).padStart(2,'0');
  }
  updateCountdown();setInterval(updateCountdown,1000);

  // Open Google Calendar's event editor prefilled for Colombo local time (UTC+05:30).
  // 09:00–12:00 on 15 Nov 2026 is 03:30–06:30 UTC. Guests confirm/save in their calendar.
  $('#addToCalendar').addEventListener('click',()=>{
    const params=new URLSearchParams({action:'TEMPLATE',text:currentLanguage==='ta'?'முருகன் & கவியம் — நிச்சயதார்த்தம்':'Murugan & Kaviyam — Engagement',dates:'20261115T033000Z/20261115T053000Z',details:currentLanguage==='ta'?'நிச்சயதார்த்த நேரம்: காலை 09:00 முதல் 11:00 வரை.':'Engagement ceremony from 9:00 AM to 11:00 AM.',location:`${VENUE_NAME}, ${VENUE_ADDRESS}`,sf:'true',output:'html'});
    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`,'_blank','noopener,noreferrer');
    showToast(t('calendarReady'));
  });

  if (rsvpForm) {
    rsvpForm.addEventListener('focusin',()=>document.body.classList.add('form-engaged'));
    rsvpForm.addEventListener('focusout',()=>setTimeout(()=>{
      if(!rsvpForm.contains(document.activeElement))document.body.classList.remove('form-engaged');
    },0));
    $$('input[name="attendance"]',rsvpForm).forEach(input=>input.addEventListener('change',updateFormFlow));
    function updateFormFlow() {
      const attendance=$('input[name="attendance"]:checked',rsvpForm)?.value;
      $('#guestCountField').hidden=attendance!=='yes';
      $('#messageField').hidden=attendance!=='no';
    }
    function updateGuestCount() {
      $('#guestCount').textContent=String(guestCount);
      $('#countDown').disabled=guestCount<=1;
      $('#countUp').disabled=guestCount>=10;
      $('#countDown').style.opacity=guestCount<=1?'.45':'1';
      $('#countUp').style.opacity=guestCount>=10?'.45':'1';
    }
    $('#countDown').addEventListener('click',()=>{guestCount=Math.max(1,guestCount-1);updateGuestCount();});
    $('#countUp').addEventListener('click',()=>{guestCount=Math.min(10,guestCount+1);updateGuestCount();});
    updateGuestCount();
    function setFeedback(title, message, isError=false) {
      const box=$('#formFeedback');box.replaceChildren();box.hidden=false;box.classList.toggle('error',isError);
      const heading=document.createElement('strong');heading.textContent=title;box.appendChild(heading);
      if (message) { const paragraph=document.createElement('span');paragraph.textContent=message;box.appendChild(paragraph); }
    }
    function showThankYouPopup(title, message) {
      const modal = $('#rsvpThankModal');
      $('#rsvpThankTitle').textContent = title;
      $('#rsvpThankMessage').textContent = message;
      $('#rsvpThankClose').textContent = t('thanksClose');
      $('#rsvpThankDismiss').setAttribute('aria-label', t('thanksClose'));
      $('#formFeedback').hidden = true;
      if (modal && typeof modal.showModal === 'function') {
        if (!modal.open) modal.showModal();
      } else {
        window.alert(`${title}\n\n${message}`);
      }
    }
    const thankModal = $('#rsvpThankModal');
    if (thankModal) {
      $('#rsvpThankClose').addEventListener('click', () => thankModal.close());
      $('#rsvpThankDismiss').addEventListener('click', () => thankModal.close());
      thankModal.addEventListener('click', event => {
        if (event.target === thankModal) thankModal.close();
      });
    }
    function personalizedMessage(name, attendance, message) {
      if(attendance==='yes') return t('thankAttend').replace('{name}',name);
      const line=t('thankNotAttend').replace('{name}',name);
      return message.trim() ? `${line} ${t('thankMessage')}` : line;
    }
    rsvpForm.addEventListener('submit',async event=>{
      event.preventDefault();if(submissionInFlight)return;
      const name=$('#guestName').value.trim();
      const attendance=$('input[name="attendance"]:checked',rsvpForm)?.value;
      const message=$('#guestMessage').value.trim();
      const honeypot=$('#website').value;
      if(!name||!attendance){setFeedback(t('formRequired'),'',true);return;}
      if(attendance==='yes'&&(!Number.isInteger(guestCount)||guestCount<1||guestCount>10)){setFeedback(t('countRequired'),'',true);return;}
      submissionInFlight=true;const submit=$('#submitRsvp');submit.disabled=true;submit.classList.add('is-loading');submit.querySelector('span:first-child').textContent=currentLanguage==='en'?'SENDING…':'அனுப்பப்படுகிறது…';
      try{
        const response=await fetch(GOOGLE_SHEETS_ENDPOINT,{
          method:'POST',
          redirect:'follow',
          credentials:'omit',
          headers:{'Content-Type':'text/plain;charset=utf-8'},
          body:JSON.stringify({name,attendance,guestCount:attendance==='yes'?guestCount:null,message,wishes:message,requestKey,website:honeypot})
        });
        const data=await response.json().catch(()=>({}));
        if(!response.ok||!data.success)throw new Error(data.error||'submit_failed');
        showThankYouPopup(t('savedTitle'),personalizedMessage(name,attendance,message));
        rsvpForm.querySelectorAll('input,textarea,button').forEach(el=>el.disabled=true);
      }catch(err){
        let feedbackTitle = t('submitFailed');
        let feedbackMessage = '';
        if (err && err.message === 'storage_not_configured') {
          feedbackTitle = t('rsvpStorageSetupTitle');
          feedbackMessage = t('rsvpStorageSetupDesc');
        } else if (err && (err.message === 'submission_failed' || err.message === 'submit_failed' || err.name === 'TypeError')) {
          feedbackTitle = t('rsvpServiceUnavailable');
        }
        setFeedback(feedbackTitle,feedbackMessage,true);
        submit.disabled=false;
        showToast(feedbackTitle);
      }finally{
        submissionInFlight=false;submit.classList.remove('is-loading');
        submit.querySelector('span:first-child').textContent=t('submitRsvp');
      }
    });
    updateFormFlow();
  }

  // First paint and language state.
  setLanguage('en');
  drawScratchSurface();
  updateCountdown();
  window.addEventListener('load', () => {
    // Repaint after mobile browsers finish laying out fonts and the card dimensions.
    requestAnimationFrame(() => { if (!dateRevealed) drawScratchSurface(); updateCountdown(); });
  }, { once: true });

})();
