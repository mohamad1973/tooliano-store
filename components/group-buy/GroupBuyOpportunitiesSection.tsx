import Link from "next/link";

import { GroupBuyOpportunityCard } from "@/components/group-buy/GroupBuyOpportunityCard";

import { fetchActiveGroupBuyOpportunities } from "@/lib/group-buy-opportunities";



export async function GroupBuyOpportunitiesSection() {

  let opportunities: Awaited<

    ReturnType<typeof fetchActiveGroupBuyOpportunities>

  > = [];



  try {
    opportunities = await fetchActiveGroupBuyOpportunities();
  } catch (err) {
    console.error("[GroupBuyOpportunitiesSection]", err);
  }



  return (

    <section className="border-t border-brand-gray bg-brand-gray/20 py-12 sm:py-16">

      <div className="mx-auto max-w-6xl px-4">

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">

          <div>

            <h2 className="text-2xl font-bold text-brand-navy sm:text-3xl">

              فرص الشراء الجماعي

            </h2>

            <p className="mt-2 max-w-xl text-sm text-brand-navy/70">
              كل منتج معتمد يبقى ظاهراً هنا دائماً — حتى بعد انتهاء العداد.
              عند انتهاء المدة يُمدَّد العرض تلقائياً يوماً جديداً.
            </p>

          </div>

        </div>



        {opportunities.length === 0 ? (

          <p className="rounded-2xl border border-dashed border-brand-gray bg-brand-white px-6 py-10 text-center text-sm text-brand-navy/60">
            لا توجد عروض معتمدة حالياً. بعد موافقة الإدارة على منتج تاجر يظهر
            هنا تلقائياً ويبقى ظاهراً حتى بعد انتهاء مدة العرض.
          </p>

        ) : (

          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {opportunities.map((item) => (

              <li key={item.id}>

                <GroupBuyOpportunityCard opportunity={item} />

              </li>

            ))}

          </ul>

        )}



        <p className="mt-8 text-center text-sm text-brand-navy/60">

          هل أنت تاجر؟{" "}

          <Link

            href="/register/vendor"

            className="font-semibold text-brand-gold hover:underline"

          >

            قدّم منتجك للمراجعة

          </Link>

        </p>

      </div>

    </section>

  );

}
