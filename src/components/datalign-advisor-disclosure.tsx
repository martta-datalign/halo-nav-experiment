import { useId } from "react"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

export function DatalignAdvisorDisclosure({ className }: { className?: string }) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className={cn("text-xs leading-relaxed text-muted-foreground", className)}
    >
      <h2
        id={titleId}
        className="font-mono text-xs font-medium uppercase tracking-[0.04em] text-foreground"
      >
        Disclosures &amp; Disclaimers
      </h2>
      <div className="mt-4 space-y-3">
        <p>
          Datalign Advisory, Inc. (“Datalign Advisory”) is a solicitor for One Wealth
          Inc. One Wealth Inc pays Datalign Advisory a referral fee for prospective
          client introductions. Learn more about what this means{" "}
          <Link to="/disclosures" className="underline underline-offset-2 hover:text-foreground">
            here
          </Link>
          . We encourage you to review One Wealth Inc’s disclosure brochure before
          making any investment decisions.
        </p>
        <p>
          Datalign Advisory, Inc. (“Datalign Advisory”) is a solicitor for the
          third-party advisors on our platform. These advisors pay Datalign Advisory a
          referral fee for prospective client introductions. This referral fee varies
          based on the information you supply in the Questionnaire and the desired
          client profile of the Matched Advisor. In return, we provide the Matched
          Advisor with the information you provide us through our Questionnaire,
          including phone number and e-mail address. This fee is paid solely by the
          Matched Advisor and is paid to Datalign Advisory regardless of whether or not
          you become a client of the Matched Advisor. There are no fees to you for the
          use of our platform. Datalign Advisory is not otherwise affiliated with the
          Matched Advisor and does not provide investment advice on its behalf.
        </p>
        <p>
          Participating Advisers pay us a fee for each Investor introduction.
          Participating Advisers may pay different levels of fees based on a
          combination of demand and profile of the Investors matched and introduced.
          This creates a conflict of interest because we could generate more revenue by
          introducing Investors to the Participating Adviser willing to spend the most,
          rather than the adviser that best suits an Investor’s needs. We mitigate this
          risk by only introducing Investors to Participating Advisers that are deemed
          suitable and match based on information Investors self-report through our
          platform. Where multiple Participating Advisers meet the requirements
          identified by an Investor and are deemed equally suitable, the introduction
          will be made to the Participating Adviser that is willing to pay us the
          highest referral fee, as determined through an auction.
        </p>
      </div>
    </section>
  )
}
