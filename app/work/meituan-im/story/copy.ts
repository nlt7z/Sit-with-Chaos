/**
 * Copy for the Meituan case study, page by page in the order of the
 * presentation deck (app/work/meituan-im/deck-story, English). Taken verbatim
 * from the deck's COPY_EN; only the em dashes are swapped for punctuation.
 *
 * Markup: ==text== is the yellow highlight, **text** is emphasis, \n breaks.
 */
export const COPY = {
  cover: {
    kicker: "Local Services · IM Consultation · 2025",
    title: "Rebuilding the Black Box",
    sub: "From “price transparency” to ==“trusted diagnosis”== in local home services.",
  },
  context: {
    eye: "Context · The Product",
    title: "Meituan local services is a super-app marketplace.",
    u: "on-demand, on-site",
    y: "discover & compare merchants",
    t: "real people do the work",
  },
  role: {
    eye: "My Role",
    title: "Platform Architecture team.\nI own UX and UI for consumer Home Services.",
    body: "This project had two goals. For users: make high-stakes services feel **less uncertain and less stressful**. For the platform: **standardize the conversation**, cut friction, and lift **order conversion**.",
  },
  voice: {
    eye: "Broken Trust · A User's Words",
    l1: "“My drain was clogged. I spent **30 minutes** and asked **10 shops**.",
    l2: "None would give a certain price. They all said **‘we have to see it first’**.",
    l3: "And once the guy shows up, ==the price only goes up==.”",
    src: "A pattern we heard again and again in user research",
  },
  broken: {
    eye: "Broken Trust",
    title: "Why showing prices didn't help:\ndeals actually close in the ==chat==.",
    body: "Users chat before they book. That is exactly where **trust breaks**: the diagnosis happens **after the visit**, but the rules force users to decide **before it**. Merchants price on the spot. Both sides close a **half-random deal**.",
    panel: "Today · A linear journey",
    steps: "A problem happens\nA wall of merchants appears\nRepeat the story to each one\nPick one, half at random",
    breakT: "→ Trust breaks",
    breakN: "Quote ≠ final bill. It ends in a surprise bill and a bad review.",
  },
  firsttry: {
    eye: "The First Attempt, and the Real Insight",
    title: "We shipped a standalone price page. Nothing moved.",
    body: "We listed prices by service category. A price without a diagnosis is **just a claim**: users didn't believe it, and merchants didn't maintain it.",
    insight: "Users never asked “how much”. They asked **“how was this number made, and will it hold”**. Price is not a number problem. It is a ==process-trust== problem.",
    revLabel: "A real user review behind the PRD",
    review: "“The page said $50. On site he added $200 for a ‘special case’. A total rip-off!”",
    revNote: "Reviews like this were everywhere. The information gap made every price feel unfair.",
  },
  optionsAB: {
    eye: "Options We Weighed",
    title: "We explored two directions first. Both got killed.",
    aT: "Option A: a priced diagnosis visit",
    aB: "The user pays a **visit fee**. A pro comes, diagnoses, then they decide whether to repair.",
    aP: "Why it failed: competitors already do this, and users **still don't trust the verdict**; the shop has every reason to make it sound worse. A visit is a **heavy commitment**; if you don't repair, you start all over.",
    bT: "Option B: protect the user's exit",
    bB: "The user can **cancel any time** after the visit. Every add-on charge needs online approval.",
    bP: "Why it failed: the platform **eats the visit cost**. Too expensive, and bad for merchants.",
  },
  optionC: {
    eye: "Option C · What We Built",
    title: "Keep the chat habit. Move the on-site diagnosis up front, as a platform-level ==standard diagnosis==. One order, many quotes.",
    note: "The key call: the problem lives at the **diagnosis step**. If the diagnosis isn't standardized, **nothing downstream can patch it**.",
  },
  blueprint: {
    eye: "Service Blueprint",
    title: "Five steps. The diagnosis moves into the conversation.",
    steps: "User starts a chat\nPlatform diagnoses first\nA structured repair order\nMerchants bid in real time\n==One tap to book==",
  },
  txn: {
    eye: "O2O · Quote-based On-demand Service",
    title: "Quote-to-Service: the full transaction flow",
    note: "The user's only decision point. Everything else hands off automatically in one order context.",
  },
  diagnose: {
    eye: "Blueprint · 01 Diagnose First (One Standard)",
    title: "No more repeating yourself to 10 shops.",
    body: "The platform owns the ask-and-diagnose step inside the chat. A **local human expert** talks to the user live, diagnoses from photos and video, and it takes about **5 minutes**. It costs more to run, and it is worth it, because it builds a **trust moat**.",
    capZh: "Shipped version · Chinese",
    capEn: "Rebuilt version · English · Live",
  },
  order: {
    eye: "Blueprint · 02 A Structured Repair Order",
    title: "“My toilet keeps hissing” becomes\na ==standardized repair order==.",
    body: "The order keeps the user's **original photos and words**, so merchants can judge with both.",
    capZh: "Shipped version · Chinese",
    capEn: "Rebuilt version · English · Live",
  },
  quoting: {
    eye: "Blueprint · 03 Live Quotes, One Standard",
    title: "Within 3 minutes: 5 nearby shops, one order.",
    body: "Merchants quote against the **exact same order**: a fixed price or a **hard-capped range** (like $80-$120). The user compares **price and speed on one standard**, instead of asking shop by shop.",
    capZh: "Shipped version · Chinese",
    capEn: "Rebuilt version · English · Live",
  },
  dialogflow: {
    eye: "Core Interaction · A Conversation That Answers Back",
    title: "The user always knows:\nwhere am I, and what happens next.",
    body: "A **stage guide** sits on top of the thread: Diagnosing ➔ Building the order ➔ Collecting quotes ➔ Locked. Cards inside the chat show their **live state**: quoting, or still searching.",
    cap: "Live prototype · English rebuild",
  },
  states: {
    eye: "Core Interaction · 5 States of the Quote Card",
    title: "A tight state machine for a 24-hour service.",
    body: "Every quote arrives with an **AI summary tag** and the merchant's info. Users can open the details, or keep collecting **new quotes**. Tap a state below: the prototype switches to that scene.",
    chips: "Bidding\nLocked\nExpired\nAfter-hours\nCancelled",
    expiredNote: "==“Visible but not clickable”== gives control back to the user. When a quote times out, making the card vanish breaks the user's mental thread. So the expired price **locks hard** and can never reach the bill; the **diagnosis and context stay**; the card just grays out. To resume, **no re-diagnosis**: only the time slot is re-quoted.",
  },
  merchant: {
    eye: "Core Interaction · How Merchants Quote",
    title: "Every merchant sees the same order. Users pick on price and speed.",
    body: "Merchants receive the **expert diagnosis** plus the user's materials: photos, video, description. They **save time** too: no idle chat, straight to the point.",
  },
  selfserve: {
    eye: "Reverse Trust · The “You Don't Need Us” Path",
    title: "Pushing small orders away\nearns the longest-lasting trust.",
    body: "If the diagnosis finds a **tiny, fixable problem** (like a worn washer), the system skips quoting and recommends a **standard part and a how-to video**: you can do this yourself.",
    cap: "Live prototype · self-serve path",
  },
  redesign: {
    eye: "Design System · Rebuilt for the US",
    title: "Rebuilt in English,\nwith Claude Code and Claude Design.",
    body: "To test this “trust conversation” in **high-labor-cost markets** (think TaskRabbit / Thumbtack), I rebuilt the Meituan-based design for US users. Expert diagnosis is too expensive there, so it becomes **AI diagnosis**.",
    capA: "Early version · Live",
    capB: "Repair Flow v1 · Live",
  },
  aiagent: {
    eye: "US Rebuild · AI Agent Diagnosis",
    title: "Planning ahead:\nan ==AI agent== replaces the human expert.",
    body: "In the US rebuild the first responder is an AI agent, not a human expert. It **answers at 2 AM**, reads photos and video, **states its confidence**, and drafts the same structured order. A human pro stays **one tap away**, and the quoting loop after it stays the same.",
    cap: "Live prototype · AI-agent workflow",
  },
  ada1: {
    eye: "Hierarchy & Accessibility (ADA) · 01",
    title: "Lower the information density",
    body: "Remove the marketing widgets and loud color blocks. **Add whitespace**. Let the **diagnosis lead**.",
    capZh: "Shipped version · dense",
    capEn: "Rebuild · whitespace",
  },
  ada2: {
    eye: "Hierarchy & Accessibility (ADA) · 02",
    title: "Accessibility",
    body: "Touch targets grow to **44×44pt**. No type under **12px**, no dark low-contrast icons. Every card reads aloud with a **screen reader**.",
  },
  ada3: {
    eye: "Hierarchy & Accessibility (ADA) · 03",
    title: "US formats and native copy",
    body: "**MM/DD/YYYY**; **imperial units**; copy rewritten to **sound native**.",
  },
  tokens: {
    eye: "Design System · Shared Components",
    title: "The conversation cards are now shared components (Design System Tokens), ready to carry into ==maternity care, banquets== and other high-stakes services.",
  },
  impact: {
    eye: "Pilot Results · User-level Randomized A/B",
    title: "July-August · Hangzhou + parts of Zhejiang · toilet repair & drain clearing",
    s1: "**Diagnostic channel**: intent-to-order converts at 1.3× the old path",
    s2: "**Search overall**: net conversion gain",
    s3: "Projected at full rollout: about **2,000 extra orders a day**",
    s4: "**Pricing complaints**: projected to drop 50%",
    note: "The test group saw our expert-diagnosis, one-order-many-quotes popup right after searching a keyword.",
  },
  ai: {
    eye: "Risk & AI Evolution · Multimodal AI Diagnosis",
    title: "Huge user data.\nTraining our own AI model is the obvious next step.",
    body: "The platform holds a huge corpus of **real consultations and real fulfilment records**: training data no one else has. To break the **expert bottleneck**, the next step is a **multimodal AI assistant**, trained on the early human-diagnosis dataset.",
    pipeLabel: "Training data pipeline",
    pipe: "Photos\nText\nRepair orders\nActual fulfilment: what was done, what was replaced, what was charged",
  },
  risk: {
    eye: "Risk · Adverse Selection",
    title: "Users shouldn't compare price.\nThey should compare ==price divided by trust==.",
    body: "This mechanism systematically selects three kinds of merchants: the desperate, the bad estimators, and the **lowball-then-upsell** players. Lowballing is the **dominant strategy**, unless breaking your quote costs more than it earns. So every quote must carry a **fulfilment score**: how often this shop's final bill lands inside its quote.",
    noteT: "Complaints",
    noteB: "No more haggling with support. The price gap is refunded first, instantly.",
  },
  proto: {
    eye: "Full Interactive Prototype · Switch Any Scene",
    note: "Switch flows from the rail under the phone, or tap the suggested replies. English / USD is the US rebuild; the shipped product is Chinese with RMB.",
  },
} as const;

/** Quote-to-Service transaction: 6 phases × 3 lanes. */
export const TXN = {
  phases: ["Listing", "Inquiry & match", "Booking & quote", "Pick & order", "Fulfilment", "Balance & redeem"],
  lanes: [
    { name: "User", cells: ["", "Start a quote request", "", "See quotes, pick one, order", "", "Pay the balance online"], decision: 3 },
    { name: "Platform", cells: ["List the service", "Match it to the request", "Create the booking", "Create the order, bind the store", "", "Create the balance order"] },
    { name: "Merchant", cells: ["", "", "Receive and quote", "Get the confirmation", "Do the on-site service", "Confirm redemption"] },
  ],
  flow: [[1, 0], [0, 1], [1, 1], [1, 2], [2, 2], [0, 3], [1, 3], [2, 3], [2, 4], [1, 5], [0, 5], [2, 5]] as [number, number][],
};

/** Prototype scenes behind the quote-card state chips (same order as the chips). */
export const STATE_FLOWS = ["default", "return-visit", "expired-chat", "off-hours", "cat-litter"];
export const EXPIRED_IDX = 2;
