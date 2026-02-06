"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { t } from "@/i18n";

const plans = [
    {
        name: "planStarterName",
        price: "planStarterPrice",
        description: "planStarterDescription",
        features: [
            "planStarterFeature1",
            "planStarterFeature2",
            "planStarterFeature3",
            "planStarterFeature4",
        ],
        cta: "planStarterCta",
        highlighted: false,
    },
    {
        name: "planProName",
        price: "planProPrice",
        description: "planProDescription",
        features: [
            "planProFeature1",
            "planProFeature2",
            "planProFeature3",
            "planProFeature4",
            "planProFeature5",
            "planProFeature6",
        ],
        cta: "planProCta",
        highlighted: true,
    },
    {
        name: "planEnterpriseName",
        price: "planEnterprisePrice",
        description: "planEnterpriseDescription",
        features: [
            "planEnterpriseFeature1",
            "planEnterpriseFeature2",
            "planEnterpriseFeature3",
            "planEnterpriseFeature4",
            "planEnterpriseFeature5",
            "planEnterpriseFeature6",
        ],
        cta: "planEnterpriseCta",
        highlighted: false,
    },
];

export function LandingPricing() {
    const translations = t().landing;
    
    return (
        <section className="space-y-16 py-20 md:py-32">
            <div className="space-y-4 text-center">
                <Badge variant="outline" className="mx-auto">{translations.pricing}</Badge>
                <h2 className="text-4xl md:text-5xl font-bold">
                    {translations.pricingTitle}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                    {translations.pricingDescription}
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 pt-12">
                {plans.map((plan, index) => (
                    <Card
                        key={index}
                        className={`relative flex flex-col p-8 ${
                            plan.highlighted ? "ring-2 ring-foreground md:scale-105" : ""
                        }`}
                    >
                        {plan.highlighted && (
                            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                                Popular
                            </Badge>
                        )}

                        <div className="space-y-2 mb-6 pt-2">
                            <h3 className="text-2xl font-bold">{translations[plan.name as keyof typeof translations]}</h3>
                            <p className="text-sm text-muted-foreground">
                                {translations[plan.description as keyof typeof translations]}
                            </p>
                        </div>

                        <div className="mb-6">
                            <span className="text-4xl font-bold">{translations[plan.price as keyof typeof translations]}</span>
                            {translations[plan.price as keyof typeof translations] !== translations.planEnterprisePrice && (
                                <span className="text-muted-foreground">/month</span>
                            )}
                        </div>

                        <Button
                            className="mb-8 w-full"
                            variant={plan.highlighted ? "default" : "outline"}
                        >
                            {translations[plan.cta as keyof typeof translations]}
                        </Button>

                        <div className="space-y-4">
                            {plan.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">{translations[feature as keyof typeof translations]}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
