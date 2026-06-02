"use client";

import { useState } from "react";
import {
  AuthSelect,
  AuthTextArea,
  AuthTextField,
} from "@/components/auth/AuthFormField";
import { VendorProductImageField } from "@/components/vendor/VendorProductImageField";
import { PRODUCT_CONDITION } from "@/lib/db/constants";

export type VendorProductDefaults = {
  productName?: string;
  productType?: string;
  productCondition?: string;
  productDescription?: string;
  specWatts?: string | null;
  specVoltage?: string | null;
  specCapacity?: string | null;
  specPower?: string | null;
  specColor?: string | null;
  specExtra?: string | null;
  outletReason?: string | null;
  suggestedQuantity?: number;
  boostReservedQuantity?: number;
  suggestedRetailPrice?: number | null;
  suggestedGroupPrice?: number | null;
  productImageUrl?: string | null;
  dealDurationDays?: number;
  dealDurationHours?: number;
  dealDurationMinutes?: number;
};

type Props = {
  defaults?: VendorProductDefaults;
  showPricing?: boolean;
  showQuantity?: boolean;
  showImage?: boolean;
  /** للتسجيل: /api/register/vendor-upload-image */
  imageUploadEndpoint?: string;
  onImageUploadStateChange?: (uploading: boolean) => void;
  showOptionalFileUpload?: boolean;
};

export function VendorProductDetailsFields({
  defaults = {},
  showPricing = true,
  showQuantity = true,
  showImage = true,
  imageUploadEndpoint,
  onImageUploadStateChange,
  showOptionalFileUpload = true,
}: Props) {
  const initialCondition =
    defaults.productCondition === PRODUCT_CONDITION.OUTLET
      ? PRODUCT_CONDITION.OUTLET
      : PRODUCT_CONDITION.NEW;

  const [condition, setCondition] = useState(initialCondition);
  const isOutlet = condition === PRODUCT_CONDITION.OUTLET;

  return (
    <div className="space-y-4">
      <AuthTextField
        label="اسم المنتج"
        name="productName"
        defaultValue={defaults.productName}
        required
      />
      <AuthTextField
        label="نوع المنتج (تصنيف المتجر)"
        name="productType"
        defaultValue={defaults.productType}
        required
        hint="مثال: عدد وأدوات، إلكترونيات، أدوات مطبخ"
      />

      <AuthSelect
        label="حالة المنتج"
        name="productCondition"
        required
        defaultValue={initialCondition}
        onChange={(e) =>
          setCondition(
            e.target.value === PRODUCT_CONDITION.OUTLET
              ? PRODUCT_CONDITION.OUTLET
              : PRODUCT_CONDITION.NEW,
          )
        }
      >
        <option value={PRODUCT_CONDITION.NEW}>جديد</option>
        <option value={PRODUCT_CONDITION.OUTLET}>أوت ليت</option>
      </AuthSelect>

      <fieldset className="space-y-3 rounded-xl border border-brand-gray/80 p-4">
        <legend className="px-2 text-sm font-bold text-brand-navy">
          المواصفات الفنية
        </legend>
        <p className="text-xs text-brand-navy/60">
          عبّئ 3 حقول على الأقل من المواصفات التالية
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <AuthTextField
            label="القدرة (واط)"
            name="specWatts"
            defaultValue={defaults.specWatts ?? ""}
            placeholder="مثال: 850"
          />
          <AuthTextField
            label="الفولت"
            name="specVoltage"
            defaultValue={defaults.specVoltage ?? ""}
            placeholder="مثال: 220V"
          />
          <AuthTextField
            label="السعة"
            name="specCapacity"
            defaultValue={defaults.specCapacity ?? ""}
          />
          <AuthTextField
            label="القدرة"
            name="specPower"
            defaultValue={defaults.specPower ?? ""}
          />
          <div className="sm:col-span-2">
            <AuthTextField
              label="اللون"
              name="specColor"
              defaultValue={defaults.specColor ?? ""}
            />
          </div>
        </div>
        <AuthTextArea
          label="مواصفات إضافية"
          name="specExtra"
          rows={4}
          defaultValue={defaults.specExtra ?? ""}
          hint="أي تفاصيل أخرى: المقاس، الضمان، الموديل، إلخ"
        />
      </fieldset>

      {isOutlet ? (
        <AuthTextArea
          label="سبب الأوت ليت (يظهر للعميل)"
          name="outletReason"
          rows={3}
          defaultValue={defaults.outletReason ?? ""}
          required
          hint="اشرح لماذا المنتج أوت ليت: عرض، كسر خارجي، آخر قطعة…"
        />
      ) : (
        <input type="hidden" name="outletReason" value="" />
      )}

      <AuthTextArea
        label="وصف تسويقي قصير (اختياري)"
        name="productDescription"
        rows={2}
        defaultValue={defaults.productDescription ?? ""}
        hint="جملة أو جملتان تظهران مع العرض — المواصفات التفصيلية في الأعلى"
      />

      {showQuantity ? (
        <>
          <AuthTextField
            label="الكمية المقترحة للحملة"
            name="suggestedQuantity"
            type="number"
            min={1}
            defaultValue={defaults.suggestedQuantity ?? ""}
            required
          />
          <AuthTextField
            label="كمية وهمية للعرض (اختياري)"
            name="boostReservedQuantity"
            type="number"
            min={0}
            defaultValue={defaults.boostReservedQuantity ?? 0}
            hint="تظهر للمشتري كحجز مسبق — الحد الأقصى 10% من الكمية المستهدفة (مثال: هدف 100 → حتى 10 قطع)"
          />
        </>
      ) : null}

      {showPricing ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthTextField
            label="السعر الفردي المقترح (ج.م)"
            name="suggestedRetailPrice"
            type="number"
            min={0}
            step="0.01"
            defaultValue={defaults.suggestedRetailPrice ?? ""}
            required
          />
          <AuthTextField
            label="سعر الشراء الجماعي المقترح (ج.م)"
            name="suggestedGroupPrice"
            type="number"
            min={0}
            step="0.01"
            defaultValue={defaults.suggestedGroupPrice ?? ""}
            required
          />
        </div>
      ) : null}

      <fieldset className="space-y-3 rounded-xl border border-brand-gray/80 p-4">
        <legend className="px-2 text-sm font-bold text-brand-navy">
          مدة الديل (العد التنازلي)
        </legend>
        <p className="text-xs text-brand-navy/60">
          يتم حساب وقت انتهاء الديل بناءً على هذه المدة بعد موافقة الإدارة.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <AuthTextField
            label="الأيام"
            name="dealDurationDays"
            type="number"
            min={0}
            defaultValue={defaults.dealDurationDays ?? 7}
            required
          />
          <AuthTextField
            label="الساعات"
            name="dealDurationHours"
            type="number"
            min={0}
            max={23}
            defaultValue={defaults.dealDurationHours ?? 0}
            required
          />
          <AuthTextField
            label="الدقائق"
            name="dealDurationMinutes"
            type="number"
            min={0}
            max={59}
            defaultValue={defaults.dealDurationMinutes ?? 0}
            required
          />
        </div>
      </fieldset>

      {showImage ? (
        <VendorProductImageField
          defaultUrl={defaults.productImageUrl}
          uploadEndpoint={imageUploadEndpoint}
          onUploadStateChange={onImageUploadStateChange}
          showOptionalFileUpload={showOptionalFileUpload}
        />
      ) : null}
    </div>
  );
}
