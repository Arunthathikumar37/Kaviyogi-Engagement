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
  let musicActive = true;
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

  const WEDDING_DATE = new Date('2026-11-15T10:00:00+05:30');
  const VENUE_NAME = 'Bajanai Kovil';
  const VENUE_ADDRESS = 'Issukazhi katteri village, Tiruvannamalai dt 606804';
  const MAP_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.0240211696955!2d79.16913437519732!3d12.110508033171502!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bacba47554082c7%3A0x3864982a4d06f19!2sPillaiyar%20Kovil!5e0!3m2!1sen!2sin!4v1793633394274!5m2!1sen!2sin';
  const MAP_URL = 'https://www.google.com/maps/search/?api=1&query=12.110508,79.169134';
  const SCRATCH_REVEAL_THRESHOLD = 0.75;
  // Public Apps Script endpoint accepts new RSVP rows; the connected spreadsheet stays private.
  const GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwQJSz6AsZmydlI31o_LFmOHJkWiforfcWzSHhB7B6djySRjK470LebH1uN18iws26k/exec';

  const EVENT_TIME_EN = '<span class="event-time"><span class="time-slot"><span class="time-digits">10:00</span> <span class="time-meridiem">am</span></span><span class="time-sep" aria-hidden="true">–</span><span class="time-slot"><span class="time-digits">12:00</span> <span class="time-meridiem">noon</span></span></span>';
  const EVENT_TIME_TA = '<span class="event-time"><span class="time-slot"><span class="time-meridiem">காலை</span> <span class="time-digits">10:00</span></span><span class="time-sep" aria-hidden="true">–</span><span class="time-slot"><span class="time-digits">12:00</span> <span class="time-meridiem">மதியம்</span></span></span>';

  const translations = {
    en: {
      openingMantra:'Aum · Sivamayam', openingEyebrow:'Together with our families', clickToOpen:'CLICK TO OPEN', openingBottom:'A joyful engagement, blessed by tradition',
      sectionOneEyebrow:'Together with our families', sectionOneTitle:'Our Engagement Celebration', familyBlessing:'With the blessings of our elders, we joyfully invite you to our engagement.', groomSide:'The beloved son of', brideSide:'The beloved daughter of', scrollExplore:'SCROLL TO EXPLORE',
      dateEyebrow:'A moment to remember', dateTitle:'Our Engagement Date', dateIntro:'Gently scratch the golden surface to reveal our engagement day.', revealedKicker:'PLEASE SAVE THE DATE', dateMain:'15 November 2026', dateWeekday:'Sunday', dateMuhurtham:'Auspicious time · ' + EVENT_TIME_EN, scratchToReveal:'SCRATCH HERE', scratchHint:'Use your finger or mouse', tapReveal:'Tap to reveal instead', countdownTitle:'Our Engagement In', days:'Days', hours:'Hours', minutes:'Minutes', seconds:'Seconds', countdownFootnote:'',
      venueEyebrow:'Join us for the celebration', venueTitle:'Engagement Venue & Directions', venueName:'Bajanai Kovil', venueAddress:'Issukazhi katteri village,<br />Tiruvannamalai dt 606804', weddingDateLabel:'Engagement date', weddingDateValue:'Sunday, 15 November 2026', muhurthamLabel:'Auspicious time', muhurthamValue:EVENT_TIME_EN, lunchLabel:'Occasion', lunchValue:'Engagement ceremony', openMap:'OPEN MAP', addCalendar:'ADD TO CALENDAR', venueNote:'We look forward to celebrating this blessed engagement with you.',
      rsvpEyebrow:'Your presence is a blessing', rsvpTitle:'Guest Wishes and Message', rsvpIntro:"Please let us know if you'll be joining us, and leave a wish if you cannot attend.", guestNameLabel:'Name of the person <span class="required-star">*</span>', guestNamePlaceholder:'Enter your name', attendingQuestion:'Will you be attending? <span class="required-star">*</span>', attendYes:"Yes, I'll attend", attendNo:"No, I can't attend", guestCountLabel:'How many guests will attend, including you? <span class="required-star">*</span>', guestCountHint:'Including you · Maximum 10 guests', guestMessageLabel:'Send us a message or your wishes <span class="optional-label">(optional)</span>', guestMessagePlaceholder:'Write a message for the couple…', submitRsvp:'SUBMIT RSVP', privacyNote:'Your response and message are private and will only be visible to the couple.', familyAdmin:'Family access · Admin',
      shareTitle:'Share Our Joy', shareIntro:'Help us share this special day with family and friends.', shareWhatsApp:'SHARE ON WHATSAPP', copyLink:'COPY INVITATION LINK', scanToOpen:'Scan to open the invitation', qrNote:'Once published, this QR code will point to the live website address.', openQr:'Open QR code to save', footerBlessing:'With love, Murugan & Kaviyam', footerTitle:'With Love', madeWithLove:'Made with love', musicOn:'MUSIC · ON', musicOff:'MUSIC · OFF',
      formRequired:'Please enter your name and select your attendance.', countRequired:'Please choose a guest count from 1 to 10.', submitFailed:'We could not save your response just now. Please check your connection and try again.', rsvpStorageSetupTitle:'RSVP storage is not connected yet.', rsvpStorageSetupDesc:'Your response was not saved. Please contact the couple so they can finish setting up private storage.', rsvpServiceUnavailable:'The RSVP service is temporarily unavailable. Your response was not saved; please try again later.',
      thankAttend:'Thank you for confirming, {name}! We look forward to welcoming you and your guests to Serendib Grand, Colombo 10.', thankNotAttend:'Thank you, {name}. We will miss you!', thankMessage:'Thank you for your lovely message and wishes.', savedTitle:'Your response has been recorded', thanksClose:'CLOSE',
      musicFailed:'The background music could not be loaded. Please check your connection and try again.', linkCopied:'Invitation link copied.', copyFailed:'Copy failed. You can copy the website link from your browser address bar.', calendarReady:'Your calendar event is ready.', qrPreview:'The QR code will point to the published website address. Deploy this project to Vercel to create the guest-ready QR code.', revealDone:'The engagement date is revealed!', weddingPassed:'The auspicious time has begun — today is your special day!', weddingComplete:'With gratitude, thank you for celebrating our engagement.', adminSetup:'Admin access is not configured yet. Set ADMIN_PASSWORD and SESSION_SECRET in Vercel project settings, then redeploy.'
    },
    ta: {
      openingMantra:'ஓம் · சிவமயம்', openingEyebrow:'எங்கள் குடும்பத்தினருடன்', clickToOpen:'அழைப்பிதழைத் திறக்கவும்', openingBottom:'மரபின் ஆசீர்வாதத்துடன் ஒரு இனிய தொடக்கம்',
      sectionOneEyebrow:'எங்கள் குடும்பத்தினருடன்', sectionOneTitle:'எங்கள் நிச்சயதார்த்த விழா', familyBlessing:'பெரியோர்களின் நல்லாசியுடன், எங்கள் நிச்சயதார்த்த விழாவில் தாங்கள் குடும்பத்துடன் கலந்து கொண்டு எங்களை வாழ்த்தி மகிழ அன்புடன் அழைக்கின்றோம்.', groomSide:'அன்பிற்கினிய மகன்', brideSide:'அன்பிற்கினிய மகள்', scrollExplore:'மேலும் காண கீழே செல்லவும்',
      dateEyebrow:'நினைவில் நிற்கும் இனிய தருணம்', dateTitle:'எங்கள் நிச்சயதார்த்த நாள்', dateIntro:'தங்க நிற அட்டையை மெதுவாகத் தேய்த்து, எங்கள் நிச்சயதார்த்த நாளைக் காணுங்கள்.', revealedKicker:'இந்த நாளைக் குறித்து வைத்துக்கொள்ளுங்கள்', dateMain:'15 நவம்பர் 2026', dateWeekday:'ஞாயிற்றுக்கிழமை', dateMuhurtham:'மங்களகரமான நேரம் · ' + EVENT_TIME_TA, scratchToReveal:'இங்கே தேய்க்கவும்', scratchHint:'விரலால் அல்லது மவுஸ் மூலம் தேய்க்கவும்', tapReveal:'தேதியைக் காண இங்கே தட்டவும்', countdownTitle:'நிச்சயதார்த்தத்திற்கு இன்னும்', days:'நாட்கள்', hours:'மணிநேரம்', minutes:'நிமிடங்கள்', seconds:'விநாடிகள்', countdownFootnote:'',
      venueEyebrow:'எங்கள் மகிழ்ச்சியில் பங்கேற்க வாருங்கள்', venueTitle:'நிச்சயதார்த்த விழா நடைபெறும் இடம்', venueName:'பஜனை கோவில்', venueAddress:'இசுக்கழி காட்டேரி கிராமம்,<br />திருவண்ணாமலை மாவட்டம் – 606804', weddingDateLabel:'நிச்சயதார்த்த நாள்', weddingDateValue:'ஞாயிற்றுக்கிழமை, 15 நவம்பர் 2026', muhurthamLabel:'மங்களகரமான நேரம்', muhurthamValue:EVENT_TIME_TA, lunchLabel:'நிகழ்வு', lunchValue:'நிச்சயதார்த்த விழா', openMap:'வழித்தடத்தைக் காண்க', addCalendar:'நாள்காட்டியில் சேர்க்கவும்', venueNote:'இந்த இனிய நிச்சயதார்த்த விழாவில் தங்களுடன் இணைந்து மகிழ்ச்சியைக் கொண்டாட ஆவலுடன் காத்திருக்கிறோம்.',
      rsvpEyebrow:'தங்கள் வருகையே எங்களுக்கு மகிழ்ச்சி', rsvpTitle:'வருகை உறுதிப்படுத்தல் மற்றும் வாழ்த்துச் செய்திகள்', rsvpIntro:'தாங்கள் விழாவில் கலந்து கொள்வீர்களா என்பதைத் தெரிவிக்கவும். வர இயலாவிட்டாலும், தங்களின் அன்பான வாழ்த்துகளைப் பகிர்ந்து கொள்ளுங்கள்.', guestNameLabel:'தங்கள் பெயர் <span class="required-star">*</span>', guestNamePlaceholder:'தங்கள் பெயரை உள்ளிடவும்', attendingQuestion:'தாங்கள் நிச்சயதார்த்த விழாவில் கலந்து கொள்வீர்களா? <span class="required-star">*</span>', attendYes:'ஆம், நிச்சயமாக வருகிறேன்', attendNo:'மன்னிக்கவும், வர இயலாது', guestCountLabel:'தங்களையும் சேர்த்து எத்தனை பேர் வருகை தருவீர்கள்? <span class="required-star">*</span>', guestCountHint:'தங்களையும் சேர்த்து · அதிகபட்சம் 10 பேர்', guestMessageLabel:'செய்தி அல்லது வாழ்த்துகளைப் பகிருங்கள் <span class="optional-label">(விருப்பத்திற்கேற்ப)</span>', guestMessagePlaceholder:'எங்களுக்காக ஒரு அன்பான வாழ்த்துச் செய்தியை எழுதுங்கள்…', submitRsvp:'பதிலைச் சமர்ப்பிக்கவும்', privacyNote:'தங்களின் பதிலும் செய்தியும் தனிப்பட்ட முறையில் பாதுகாக்கப்படும். மணமக்கள் மட்டுமே அவற்றைப் பார்க்க முடியும்.', familyAdmin:'குடும்ப அணுகல் · நிர்வாகம்',
      shareTitle:'எங்கள் மகிழ்ச்சியைப் பகிருங்கள்', shareIntro:'இந்த இனிய நாளைத் தங்கள் குடும்பத்தினர் மற்றும் நண்பர்களுடன் பகிர்ந்து கொள்ளுங்கள்.', shareWhatsApp:'வாட்ஸ்அப்பில் பகிரவும்', copyLink:'அழைப்பிதழ் இணைப்பை நகலெடுக்கவும்', scanToOpen:'அழைப்பிதழைத் திறக்க ஸ்கேன் செய்யவும்', qrNote:'இணையதளத்தை வெளியிட்ட பிறகு, இந்த QR குறியீடு நேரடி அழைப்பிதழைத் திறக்கும்.', openQr:'சேமிக்க QR குறியீட்டைத் திறக்கவும்', footerBlessing:'அன்புடன், முருகன் & காவியம்', footerTitle:'அன்புடன்', madeWithLove:'அன்புடன் உருவாக்கப்பட்டது', musicOn:'இசை · இயங்குகிறது', musicOff:'இசை · நிறுத்தப்பட்டுள்ளது',
      formRequired:'தங்களின் பெயரை உள்ளிட்டு, வருகை நிலையைத் தேர்வு செய்யவும்.', countRequired:'1 முதல் 10 வரையிலான விருந்தினர் எண்ணிக்கையைத் தேர்வு செய்யவும்.', submitFailed:'தங்களின் பதிலை இப்போது சேமிக்க முடியவில்லை. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.', rsvpStorageSetupTitle:'விருந்தினர் பதில்களைச் சேமிக்கும் வசதி இன்னும் அமைக்கப்படவில்லை.', rsvpStorageSetupDesc:'தங்களின் பதில் சேமிக்கப்படவில்லை. தனிப்பட்ட சேமிப்பு வசதியை அமைக்க மணமக்களைத் தொடர்பு கொள்ளவும்.', rsvpServiceUnavailable:'பதில் அனுப்பும் சேவை தற்காலிகமாகச் செயல்படவில்லை. தங்களின் பதில் சேமிக்கப்படவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.',
      thankAttend:'{name}, தங்களின் வருகையை உறுதிப்படுத்தியதற்கு மனமார்ந்த நன்றி! பஜனை கோவிலில் நடைபெறும் எங்கள் நிச்சயதார்த்த விழாவில் தங்களையும் தங்கள் குடும்பத்தினரையும் வரவேற்க ஆவலுடன் காத்திருக்கிறோம்.', thankNotAttend:'{name}, தங்களுக்கு மனமார்ந்த நன்றி. தங்களின் வருகையை நிச்சயமாக எதிர்பார்த்திருப்போம்!', thankMessage:'தங்களின் அன்பான வாழ்த்துகளுக்கும் அழகான செய்திக்கும் மனமார்ந்த நன்றி.', savedTitle:'தங்களின் பதில் வெற்றிகரமாகப் பதிவு செய்யப்பட்டது', thanksClose:'மூடவும்',
      musicFailed:'பின்னணி இசையை இயக்க முடியவில்லை. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.', linkCopied:'அழைப்பிதழ் இணைப்பு நகலெடுக்கப்பட்டது.', copyFailed:'இணைப்பை நகலெடுக்க முடியவில்லை. உலாவியின் முகவரிப் பட்டியிலிருந்து இணைப்பை நகலெடுக்கவும்.', calendarReady:'நாள்காட்டியில் சேர்ப்பதற்கான நிகழ்வு தயார்.', qrPreview:'இந்த QR குறியீடு வெளியிடப்பட்ட இணையதளத்தின் முகவரியைத் திறக்கும். விருந்தினர்களுடன் பகிர்வதற்கு Vercel-இல் இணையதளத்தை வெளியிடவும்.', revealDone:'எங்கள் நிச்சயதார்த்த நாள் தெரிய வந்துவிட்டது!', weddingPassed:'மங்களகரமான நேரம் தொடங்கிவிட்டது — இன்று எங்கள் வாழ்வின் இனிய நாள்!', weddingComplete:'எங்கள் நிச்சயதார்த்த விழாவில் கலந்து கொண்டு சிறப்பித்த அனைவருக்கும் மனமார்ந்த நன்றி.', adminSetup:'நிர்வாக அணுகல் இன்னும் அமைக்கப்படவில்லை. Vercel திட்ட அமைப்புகளில் ADMIN_PASSWORD மற்றும் SESSION_SECRET ஆகியவற்றை அமைத்து மீண்டும் வெளியிடவும்.'
    }
  };

  const nameTranslations = {
    en: {groom:'Murugan', groomNick:'(Yogesh)', bride:'Kaviyam', groomParents:'Mr. Elumalai & Mrs. Dhanalakshmi', brideParents:'Mr. Shanmugam & Mrs. Nalini'},
    ta: {groom:'முருகன்', groomNick:'(யோகேஷ்)', bride:'காவியம்', groomParents:'திரு. ஏழுமலை, திருமதி. தனலக்ஷ்மி', brideParents:'திரு. சண்முகம், திருமதி. நளினி'}
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
    const brideNickEl = $('#sectionBrideNick');
    if (brideNickEl) {
      brideNickEl.textContent = '';
      brideNickEl.hidden = true;
    }
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
    syncMapLink();
    syncMusicToggle(musicActive);
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
  $('#languageToggle').addEventListener('click', () => {
    setLanguage(currentLanguage === 'en' ? 'ta' : 'en');
    if (musicActive) attemptMusicPlayback(false);
  });

  // Keep the shared couple cutout visible through the invitation, with a compact size in the footer.
  const footerSectionForImage = $('#shareSection');
  if (footerSectionForImage && 'IntersectionObserver' in window) {
    const footerImageObserver = new IntersectionObserver((entries) => {
      const footerVisible = entries.some((entry) => entry.isIntersecting);
      document.body.classList.toggle('footer-in-view', footerVisible);
    }, { threshold: 0.02 });
    footerImageObserver.observe(footerSectionForImage);
  }

  backgroundMusic.volume = 0.22;
  function syncMusicToggle(isPlaying) {
    const toggle = $('#musicToggle');
    if (!toggle) return;
    toggle.classList.toggle('is-playing', isPlaying);
    toggle.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    toggle.setAttribute('aria-label', isPlaying
      ? (currentLanguage === 'en' ? 'Turn background music off' : 'பின்னணி இசையை நிறுத்தவும்')
      : (currentLanguage === 'en' ? 'Turn background music on' : 'பின்னணி இசையை இயக்கவும்'));
    toggle.querySelector('.music-label').textContent = t(isPlaying ? 'musicOn' : 'musicOff');
  }
  async function attemptMusicPlayback(showErrors = true) {
    try {
      await backgroundMusic.play();
      musicActive = true;
      syncMusicToggle(true);
      return true;
    } catch (err) {
      if (showErrors) {
        musicActive = false;
        syncMusicToggle(false);
        showToast(t('musicFailed'));
      }
      return false;
    }
  }
  function bindOpeningScreenMusic() {
    const startMusicFromGesture = () => { attemptMusicPlayback(false); };
    openingScreen.addEventListener('pointerdown', startMusicFromGesture, { once: true });
    window.addEventListener('load', () => { attemptMusicPlayback(false); }, { once: true });
  }
  bindOpeningScreenMusic();
  $('#musicToggle').addEventListener('click', async () => {
    if (musicActive) {
      backgroundMusic.pause();
      musicActive = false;
      syncMusicToggle(false);
    } else {
      await attemptMusicPlayback(true);
    }
  });
  backgroundMusic.addEventListener('pause', () => {
    if (!backgroundMusic.ended && !musicActive) {
      syncMusicToggle(false);
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

  function syncMapLink() {
    const mapLink = $('#openMapLink');
    if (mapLink) {
      mapLink.href = MAP_URL;
      mapLink.setAttribute('rel', 'noopener');
    }
    const mapEmbed = $('#venueMapEmbed');
    if (mapEmbed && mapEmbed.src !== MAP_EMBED_URL) mapEmbed.src = MAP_EMBED_URL;
  }

  function openVenueMap(event) {
    if (event) event.preventDefault();
    const pinUrl = MAP_URL;
    const isMobile = window.matchMedia('(max-width: 760px)').matches
      || window.matchMedia('(pointer: coarse)').matches
      || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.assign(pinUrl);
      return;
    }
    const mapWindow = window.open(pinUrl, '_blank', 'noopener');
    if (!mapWindow) {
      window.location.assign(pinUrl);
    }
  }

  const mapLink = $('#openMapLink');
  if (mapLink) {
    syncMapLink();
    mapLink.addEventListener('click', openVenueMap);
  }

  // Open Google Calendar's event editor prefilled for IST (UTC+05:30).
  // 10:00–12:00 on 15 Nov 2026 is 04:30–06:30 UTC. Guests confirm/save in their calendar.
  $('#addToCalendar').addEventListener('click',()=>{
    const mapLine = currentLanguage === 'ta' ? `வரைபடம்: ${MAP_URL}` : `Map: ${MAP_URL}`;
    const params=new URLSearchParams({action:'TEMPLATE',text:currentLanguage==='ta'?'முருகன் & காவியம் — நிச்சயதார்த்தம்':'Murugan & Kaviyam — Engagement',dates:'20261115T043000Z/20261115T063000Z',details:`${currentLanguage==='ta'?'நிச்சயதார்த்த நேரம்: காலை 10:00 முதல் 12:00 மதியம் வரை.':'Engagement ceremony from 10:00 am to 12:00 noon.'}\n${mapLine}`,location:`${VENUE_NAME}, ${VENUE_ADDRESS}`,sf:'true',output:'html'});
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

  syncMusicToggle(true);

  // First paint and language state.
  setLanguage('en');
  drawScratchSurface();
  updateCountdown();
  window.addEventListener('load', () => {
    // Repaint after mobile browsers finish laying out fonts and the card dimensions.
    requestAnimationFrame(() => { if (!dateRevealed) drawScratchSurface(); updateCountdown(); });
  }, { once: true });

})();
