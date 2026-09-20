# 🏷️ دليل بناء موديل العروض (Offers Module) والـ Validations بالكامل

هذا الدليل يشرح لك بالتفصيل والترتيب كل خطوة تحتاج لتنفيذها لبناء موديل الـ **Offers** مع التركيز الكامل على قواعد وشفرات التحقق من البيانات (**Joi Validations**).

---

## 📑 فهرس المحتويات
1. [خريطة وبنية المجلدات (Folder Structure)](#1-خريطة-وبنية-المجلدات-folder-structure)
2. [تصميم قاعدة البيانات (Prisma Model)](#2-تصميم-قاعدة-البيانات-prisma-model)
3. [الـ Enums والثوابت (Constants & Enums)](#3-الـ-enums-والثوابت-constants--enums)
4. [شرح وتفاصيل الـ Validation لكل Endpoint بالتفصيل](#4-شرح-وتفاصيل-الـ-validation-لكل-endpoint-بالتفصيل)
5. [كود ملف الـ Validation بالكامل (offers.validation.js)](#5-كود-ملف-الـ-validation-بالكامل-offersvalidationjs)
6. [ترتيب خطوات التنفيذ خطوة بخطوة](#6-ترتيب-خطوات-التنفيذ-خطوة-بخطوة)

---

## 1. خريطة وبنية المجلدات (Folder Structure)

ستقوم بإنشاء المجلدات والملفات التالية داخل المشروع:

```text
LearnexBack/
├── prisma/
│   └── schema/
│       └── offer.prisma                     # موديل العروض في قاعدة البيانات
└── src/
    ├── utils/
    │   └── Enums/
    │       └── offer.enum.js                # الـ Enums الخاصة بالحالات والأنواع
    └── modules/
        └── admin/
            └── offers/
                ├── offers.validation.js     # 👈 ملف التحقق من صحة المدخلات (Joi)
                ├── offers.controller.js     # استقبال الطلبات وإرجاع الردود
                ├── offers.service.js        # منطق العمليات وقواعد البيانات
                └── offers.routes.js         # توجيه الـ Endpoints وتأمينها
```

---

## 2. تصميم قاعدة البيانات (Prisma Model)

أنشئ الملف `prisma/schema/offer.prisma`:

```prisma
enum OfferStatus {
  ACTIVE
  INACTIVE
  SCHEDULED
  EXPIRED
}

enum OfferType {
  PERCENTAGE
  FIXED_AMOUNT
  BUY_ONE_GET_ONE
  FREE_SHIPPING
  CUSTOM
}

model Offer {
  id          String       @id @default(uuid())
  name        String
  target      String       @default("All Users")
  offerType   OfferType    @default(PERCENTAGE)
  offerDesc   String       @db.Text
  discount    Decimal?     @db.Decimal(10, 2)
  startDate   DateTime
  endDate     DateTime
  status      OfferStatus  @default(ACTIVE)

  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([status])
  @@index([startDate])
  @@index([endDate])
  @@map("offers")
}
```

---

## 3. الـ Enums والثوابت (Constants & Enums)

أنشئ الملف `src/utils/Enums/offer.enum.js`:

```javascript
export const offerStatusEnum = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SCHEDULED: "SCHEDULED",
  EXPIRED: "EXPIRED",
};

export const offerTypeEnum = {
  PERCENTAGE: "PERCENTAGE",
  FIXED_AMOUNT: "FIXED_AMOUNT",
  BUY_ONE_GET_ONE: "BUY_ONE_GET_ONE",
  FREE_SHIPPING: "FREE_SHIPPING",
  CUSTOM: "CUSTOM",
};
```

---

## 4. شرح وتفاصيل الـ Validation لكل Endpoint بالتفصيل

هنا تفصيل كل Endpoint وما هي شروط التحقق منها:

### 1️⃣ إنشاء عرض جديد (`POST /api/v1/admin/offers`)
* **الهدف:** إضافة عرض جديد مع التحقق من صحة جميع المدخلات.
* **الشروط المطلوبة:**
  * `name`: نص مطلوب، لا يقل عن 3 حروف ولا يزيد عن 150 حرفاً.
  * `target`: نص مطلوب (الجمهور المستهدف مثل `All Users` أو `Students`).
  * `offerType`: نوع العرض، يجب أن يكون إحدى القيم المعرفة في `offerTypeEnum`.
  * `offerDesc`: وصف العرض، نص مطلوب لا يقل عن 5 حروف ولا يزيد عن 2000 حرف.
  * `discount`: رقم اختياري (قيمة الخصم أو النسبة)، يجب أن يكون رقماً موجباً (>= 0).
  * `startDate`: تاريخ صالح (ISO Date)، مطلوب.
  * `endDate`: تاريخ صالح (ISO Date)، مطلوب، ويجب أن يكون **بعد تاريخ البدء أو مساوياً له** (`endDate >= startDate`).
  * `status`: حالة العرض الأولية (اختياري، وقيمته الافتراضية `ACTIVE`).

---

### 2️⃣ جلب كل العروض مع الفلترة (`GET /api/v1/admin/offers`)
* **الهدف:** جلب قائمة العروض مع التصفح والبحث.
* **شروط الـ Query Params:**
  * `page`: رقم صحيح، اختياري، يبدأ من 1 (Default: 1).
  * `limit`: رقم صحيح، اختياري، بين 1 و 100 (Default: 10).
  * `search`: نص اختياري للبحث في الاسم أو الوصف.
  * `status`: اختيار حالة محددة من `offerStatusEnum` أو تركه لجلب الكل.
  * `offerType`: اختيار نوع محدد من `offerTypeEnum`.
  * `target`: فلترة حسب الفئة المستهدفة.
  * `sort`: ترتيب حسب حقل محدد (`createdAt`, `startDate`, `endDate`, `name`).
  * `sortType`: نوع الترتيب (`asc` أو `desc`).

---

### 3️⃣ جلب تفاصيل عرض محدد (`GET /api/v1/admin/offers/:offerId`)
* **الهدف:** جلب بيانات عرض مفرد.
* **شروط الـ Params:**
  * `offerId`: معرف فريد (UUID) إجباري مطابق لـ `generalFields.id`.

---

### 4️⃣ تعديل بيانات العرض (`PATCH /api/v1/admin/offers/:offerId`)
* **الهدف:** تعديل أي حقل من حقول العرض.
* **الشروط:**
  * `params`: معرف العرض `offerId` (UUID) مطلوب.
  * `body`: جميع الحقول اختيارية، ولكن **يجب إرسال حقل واحد على الأقل للتعديل** (`min(1)`).
  * لو تم إرسال `startDate` و `endDate` معاً، يجب أن يكون `endDate >= startDate`.

---

### 5️⃣ تغيير حالة العرض فقط (`PATCH /api/v1/admin/offers/:offerId/status`)
* **الهدف:** تفعيل أو تعطيل العرض بزر واحد من الواجهة.
* **الشروط:**
  * `params`: معرف العرض `offerId` (UUID) مطلوب.
  * `body`:
    * `status`: قيمة مطلوبة ويجب أن تكون من ضمن `offerStatusEnum` (`ACTIVE`, `INACTIVE`, `SCHEDULED`, `EXPIRED`).

---

### 6️⃣ حذف عرض (`DELETE /api/v1/admin/offers/:offerId`)
* **الهدف:** مسح العرض من قاعدة البيانات.
* **الشروط:**
  * `params`: معرف العرض `offerId` (UUID) مطلوب.

---

### 7️⃣ تصدير العروض لملف إكسيل (`GET /api/v1/admin/offers/export`)
* **الهدف:** تحميل تقرير إكسيل بالعروض المطابقة للفلاتر.
* **الشروط:** نفس فلاتر البحث في الـ `query` بدون شروط الـ pagination.

---

## 5. كود ملف الـ Validation بالكامل (`offers.validation.js`)

أنشئ الملف `src/modules/admin/offers/offers.validation.js` وضع الكود التالي:

```javascript
import joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";
import { offerStatusEnum, offerTypeEnum } from "../../../utils/Enums/offer.enum.js";

/**
 * 1. فحص مدخلات إنشاء عرض جديد
 */
export const createOffer = {
  body: joi
    .object()
    .keys({
      name: joi.string().min(3).max(150).trim().required().messages({
        "string.base": "OFFER_NAME_STRING",
        "string.empty": "OFFER_NAME_REQUIRED",
        "string.min": "OFFER_NAME_MIN",
        "string.max": "OFFER_NAME_MAX",
        "any.required": "OFFER_NAME_REQUIRED",
      }),
      target: joi.string().min(2).max(100).trim().required().messages({
        "string.base": "OFFER_TARGET_STRING",
        "string.empty": "OFFER_TARGET_REQUIRED",
        "any.required": "OFFER_TARGET_REQUIRED",
      }),
      offerType: joi
        .string()
        .valid(...Object.values(offerTypeEnum))
        .required()
        .messages({
          "any.only": "INVALID_OFFER_TYPE",
          "any.required": "OFFER_TYPE_REQUIRED",
        }),
      offerDesc: joi.string().min(5).max(2000).trim().required().messages({
        "string.base": "OFFER_DESC_STRING",
        "string.empty": "OFFER_DESC_REQUIRED",
        "string.min": "OFFER_DESC_MIN",
        "any.required": "OFFER_DESC_REQUIRED",
      }),
      discount: joi.number().min(0).optional().messages({
        "number.base": "DISCOUNT_MUST_BE_NUMBER",
        "number.min": "DISCOUNT_MIN_ZERO",
      }),
      startDate: joi.date().iso().required().messages({
        "date.base": "START_DATE_INVALID",
        "date.format": "START_DATE_ISO_FORMAT",
        "any.required": "START_DATE_REQUIRED",
      }),
      endDate: joi
        .date()
        .iso()
        .min(joi.ref("startDate"))
        .required()
        .messages({
          "date.base": "END_DATE_INVALID",
          "date.format": "END_DATE_ISO_FORMAT",
          "date.min": "END_DATE_MUST_BE_AFTER_START_DATE",
          "any.required": "END_DATE_REQUIRED",
        }),
      status: joi
        .string()
        .valid(...Object.values(offerStatusEnum))
        .default(offerStatusEnum.ACTIVE)
        .optional(),
    })
    .required()
    .options({ allowUnknown: false }),
};

/**
 * 2. فحص الـ Params لمعرف العرض
 */
export const getOfferById = {
  params: joi
    .object()
    .keys({
      offerId: generalFields.id.required().messages({
        "string.empty": "OFFER_ID_REQUIRED",
        "string.guid": "INVALID_OFFER_ID_FORMAT",
        "any.required": "OFFER_ID_REQUIRED",
      }),
    })
    .required()
    .options({ allowUnknown: false }),
};

/**
 * 3. فحص مدخلات جلب كل العروض (Pagination & Filtering)
 */
export const getAllOffers = {
  query: joi
    .object()
    .keys({
      page: joi.number().integer().min(1).default(1),
      limit: joi.number().integer().min(1).max(100).default(10),
      search: joi.string().trim().allow("").optional(),
      status: joi
        .string()
        .valid(...Object.values(offerStatusEnum))
        .optional(),
      offerType: joi
        .string()
        .valid(...Object.values(offerTypeEnum))
        .optional(),
      target: joi.string().trim().allow("").optional(),
      sort: joi
        .string()
        .valid("createdAt", "startDate", "endDate", "name")
        .default("createdAt")
        .optional(),
      sortType: joi.string().valid("asc", "desc").default("desc").optional(),
    })
    .options({ allowUnknown: false }),
};

/**
 * 4. فحص مدخلات تعديل العرض
 */
export const updateOffer = {
  params: getOfferById.params,
  body: joi
    .object()
    .keys({
      name: joi.string().min(3).max(150).trim().optional(),
      target: joi.string().min(2).max(100).trim().optional(),
      offerType: joi
        .string()
        .valid(...Object.values(offerTypeEnum))
        .optional(),
      offerDesc: joi.string().min(5).max(2000).trim().optional(),
      discount: joi.number().min(0).optional(),
      startDate: joi.date().iso().optional(),
      endDate: joi.date().iso().optional(),
      status: joi
        .string()
        .valid(...Object.values(offerStatusEnum))
        .optional(),
    })
    .min(1)
    .required()
    .options({ allowUnknown: false }),
};

/**
 * 5. فحص تعديل حالة العرض فقط
 */
export const changeOfferStatus = {
  params: getOfferById.params,
  body: joi
    .object()
    .keys({
      status: joi
        .string()
        .valid(...Object.values(offerStatusEnum))
        .required()
        .messages({
          "any.only": "INVALID_STATUS_VALUE",
          "any.required": "STATUS_REQUIRED",
        }),
    })
    .required()
    .options({ allowUnknown: false }),
};

/**
 * 6. فحص حذف العرض
 */
export const deleteOffer = {
  params: getOfferById.params,
};

/**
 * 7. فحص تصدير الإكسيل
 */
export const exportOffers = {
  query: joi
    .object()
    .keys({
      search: joi.string().trim().allow("").optional(),
      status: joi
        .string()
        .valid(...Object.values(offerStatusEnum))
        .optional(),
      offerType: joi
        .string()
        .valid(...Object.values(offerTypeEnum))
        .optional(),
      target: joi.string().trim().allow("").optional(),
    })
    .options({ allowUnknown: false }),
};
```

---

## 6. ترتيب خطوات التنفيذ خطوة بخطوة

عندما تقرر البدء في كتابة الكود بنفسك، اتبع هذا الترتيب المنطقي:

1. **الخطوة 1:** إنشاء ملف `prisma/schema/offer.prisma` وإضافة الموديل.
2. **الخطوة 2:** تشغيل أمر التهجير والتوليد:
   ```bash
   npx prisma migrate dev --name init_offers
   npm run prisma:generate
   ```
3. **الخطوة 3:** إنشاء ملف `src/utils/Enums/offer.enum.js` وتعريف الثوابت.
4. **الخطوة 4:** إنشاء ملف `src/modules/admin/offers/offers.validation.js` وكتابة الـ Schemas الموجودة في هذا الدليل.
5. **الخطوة 5:** كتابة دوال الـ `offers.service.js` (لحساب الإحصائيات، الحفظ، الفلترة، التعديل، الحذف، والإكسيل).
6. **الخطوة 6:** كتابة دوال الـ `offers.controller.js` واستدعاء الـ Services.
7. **الخطوة 7:** كتابة `offers.routes.js` وربطه بالـ `admin.routes.js`.
8. **الخطوة 8:** تجربة الطلبات بـ Postman للتأكد من رسائل الـ Validation عند إرسال بيانات خاطئة أو ناقصة.
