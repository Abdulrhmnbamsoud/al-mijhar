---
name: Editorial Intelligence Workspace
colors:
  surface: '#111317'
  surface-dim: '#111317'
  surface-bright: '#37393d'
  surface-container-lowest: '#0c0e11'
  surface-container-low: '#1a1c1f'
  surface-container: '#1e2023'
  surface-container-high: '#282a2d'
  surface-container-highest: '#333538'
  on-surface: '#e2e2e6'
  on-surface-variant: '#c4c9ac'
  inverse-surface: '#e2e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#8e9379'
  outline-variant: '#444933'
  surface-tint: '#abd600'
  primary: '#ffffff'
  on-primary: '#283500'
  primary-container: '#c3f400'
  on-primary-container: '#556d00'
  inverse-primary: '#506600'
  secondary: '#c2c6d5'
  on-secondary: '#2b303c'
  secondary-container: '#444955'
  on-secondary-container: '#b4b8c7'
  tertiary: '#ffffff'
  on-tertiary: '#002e6a'
  tertiary-container: '#d8e2ff'
  on-tertiary-container: '#0060ce'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c3f400'
  primary-fixed-dim: '#abd600'
  on-primary-fixed: '#161e00'
  on-primary-fixed-variant: '#3c4d00'
  secondary-fixed: '#dee2f1'
  secondary-fixed-dim: '#c2c6d5'
  on-secondary-fixed: '#171c26'
  on-secondary-fixed-variant: '#424753'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#111317'
  on-background: '#e2e2e6'
  surface-variant: '#333538'
  canvas-base: '#0D0F12'
  surface-card: '#181C24'
  surface-elevated: '#1E232E'
  border-subtle: '#283040'
  text-ivory: '#F9FAFB'
  text-muted: '#9CA3AF'
  text-dim: '#6B7280'
  accent-acid: '#CCFF00'
  badge-fact-text: '#10B981'
  badge-fact-bg: '#064E3B'
  badge-claim-text: '#3B82F6'
  badge-claim-bg: '#1E3A8A'
  badge-reporting: '#8B5CF6'
  badge-inference: '#F59E0B'
  badge-gap-risk: '#EF4444'
typography:
  display-hero:
    fontFamily: IBM Plex Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 44px
  display-hero-mobile:
    fontFamily: IBM Plex Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: IBM Plex Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 38px
  headline-md:
    fontFamily: IBM Plex Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 34px
  headline-sm:
    fontFamily: IBM Plex Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 30px
  body-lead:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-default:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-dense:
    fontFamily: IBM Plex Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  caption-code:
    fontFamily: IBM Plex Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.25rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

# نظام تصميم «المِجهر» (Al-Mijhar Design System)

تطبيق ويب استقصائي بحثي لإعداد المحاورين ومقابلة الضيوف.

## 1. الهوية البصرية وفلسفة التصميم (Visual Personality & Tone)
- **الطابع العام**: صحافة استقصائية ذكية، رصانة تحريرية رفيعة المستوى، تصميم معلوماتي كثيف ومنظم بدقة (Editorial Intelligence Workspace).
- **الاتجاه اللغوي وتجربة المستخدم**: واجهة عربية أصيلة مع دعم كامل وفائق للاتجاه من اليمين لليسار (RTL First).
- **الابتعاد عن**: التدرجات اللونية العشوائية لبرمجيات الذكاء الاصطناعي، الزجاج المفرط (Glassmorphism)، البطاقات العائمة، عناصر الألعاب والنيون، والعناوين التسويقية الضخمة.

## 2. لوحة الألوان (Color Palette & Tokens)
- **الخلفيات (Backgrounds)**:
  - الخلفية الرئيسية (Dark Graphite): `#0D0F12` / `#12151A`
  - أسطح البطاقات والحاويات (Card Surface): `#181C24`
  - الأسطح المرتفعة والمداخل (Elevated / Input Surface): `#1E232E`
  - خطوط الحدود الفاصلة (Subtle Borders): `#283040` (شفافية دقيقة borders-white/10)
- **ألوان النصوص (Typography Colors)**:
  - النص الأساسي الفاخر (High-Contrast Ivory): `#F3F4F6` أو `#F9FAFB`
  - النص الثانوي المساعد (Muted Ivory/Slate): `#9CA3AF`
  - النصوص الخافتة والتسميات (Tertiary / Captions): `#6B7280`
- **لون التمييز الاستقصائي (Accent)**:
  - الليموني الحمضي المتقد (Acid-Lime): `#D4FF00` أو `#CCFF00` (لون الطاقة والتركيز والعناوين النشطة والمؤشرات الحية)
  - لون تفاعلي داكن مع الليموني: نصوص بلون `#0D0F12` على خلفية الليموني.
- **ألوان المؤشرات والمصداقية (Evidence & Confidence Badges)**:
  - موثّق / حقيقة ثابتة (Verified Fact): زمردي هادئ `#10B981` / أسطح `#064E3B`
  - ادعاء للضيف (Claim by Guest): أزرق وقور `#3B82F6` / أسطح `#1E3A8A`
  - تغطية مستقلة (Independent Reporting): بنفسجي تحريري `#8B5CF6`
  - استنتاج تحليلي (Reasoned Inference): كهرماني تحذيري `#F59E0B`
  - مواطن تحقق / فجوات (Verification Gap / Risk): أحمر تحذيري وقور `#EF4444`

## 3. الخطوط والطباعة (Typography)
- **الخط الأساسي**: خط عربي حديث ورصين ومريح للقراءة المكثفة مثل `IBM Plex Sans Arabic` أو `Readex Pro` أو `Tajawal`.
- **أحجام النصوص**:
  - الحجم الأدنى للنصوص العامة (Body Text): `16px` لضمان الوضوح التام.
  - العناوين الرئيسية للأقسام: `20px` - `24px` (Semibold / Bold).
  - عناوين المحاور والملخص التنفيذي: `28px` - `32px`.
  - الأرقام والمؤشرات: أرقام لاتينية واضحة أو عربية متناسقة عالية الوضوح.

## 4. المكونات الأساسية (Core UI Components)
- **نموذج البحث المباشر (Search Form)**: مدخل اسم الضيف الإجباري، الوظيفة، المنظمة، الدولة، الرابط، عمق البحث (سريع، متقدم، عميق)، زر الإجراء الرئيسي «ابدأ البحث الحقيقي» بلون Acid-Lime المميز.
- **مؤشر التقدم الحقيقي (Real Progress Tracker)**: مراحل البحث الحقيقية المتزامنة، عداد المصادر والوقت المنقضي مع زر إلغاء أنيق.
- **البطاقات التحقيقية (Evidence & Dossier Cards)**: خط زمني تفاعلي بأعمدة متسقة، بطاقات نقاط القوة مع روابط المصادر بالأرقام [1]، بطاقات فجوات التحقق والمواضيع الحساسة.
- **جدول سجل المصادر (Source Ledger)**: تصفية متقدمة، درجة الموثوقية، ونوع المصدر مع روابط فحص صريحة.
- **أنماط التصدير (Export Actions)**: تصدير ورقة الأسئلة، تقرير PDF، أو نسخ بتنسيق Markdown.
