'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqData = [
  {
    category: 'Ordering & Delivery',
    questions: [
      {
        question: 'What are your delivery areas?',
        answer:
          'We deliver within a 15km radius of our restaurant in Toronto. This includes downtown Toronto, North York, Scarborough, and parts of Mississauga. Delivery fees may vary based on distance.',
      },
      {
        question: 'How long does delivery take?',
        answer:
          'Standard delivery takes 30-45 minutes during regular hours. During peak times (Friday-Sunday evenings), it may take up to 60 minutes. We always provide real-time tracking for your order.',
      },
      {
        question: 'Do you offer pickup orders?',
        answer:
          'Yes! Pickup orders are available and typically ready within 20-30 minutes. You can place pickup orders online or by calling us directly. We offer a 10% discount on all pickup orders.',
      },
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, PayPal, and cash for pickup orders. Online payments are processed securely through our payment gateway.',
      },
    ],
  },
  {
    category: 'Menu & Food',
    questions: [
      {
        question: 'Are your dishes authentic West African cuisine?',
        answer:
          'Absolutely! Our chef, Kwame Asante, is from Ghana and uses traditional recipes passed down through generations. We source authentic spices and ingredients directly from West Africa when possible.',
      },
      {
        question: 'Do you have vegetarian and vegan options?',
        answer:
          'Yes, we offer several vegetarian options including our vegetable jollof rice, plantain dishes, and various vegetable soups. Many of our dishes can be made vegan upon request - just let us know when ordering.',
      },
      {
        question: 'How spicy are your dishes?',
        answer:
          "We offer different spice levels for most dishes: Low, Medium, Extra, and African Hot. If you're new to African cuisine, we recommend starting with Medium. Our African Hot is quite spicy and authentic to traditional preparations.",
      },
      {
        question: 'Can I customize my order?',
        answer:
          'Yes! Most of our dishes can be customized. You can adjust spice levels, add extra meat or vegetables, choose your starch (rice, fufu, yam), and add special instructions for dietary restrictions.',
      },
    ],
  },
  {
    category: 'Packages & Catering',
    questions: [
      {
        question: 'How do your meal packages work?',
        answer:
          'We offer Daily, Weekly, and Monthly packages with pre-selected authentic dishes. Packages include a variety of mains, sides, and soups. You can customize the contents and schedule delivery dates that work for you.',
      },
      {
        question: 'Do you offer catering services?',
        answer:
          'Yes! We provide catering for events of 10+ people. We offer buffet-style setups, individual meal boxes, and family-style platters. Please contact us at least 48 hours in advance for catering orders.',
      },
      {
        question: 'Can I cancel or modify my package subscription?',
        answer:
          'You can modify or cancel your package subscription at any time with at least 24 hours notice. Changes can be made through your online account or by calling us directly.',
      },
    ],
  },
  {
    category: 'Allergies & Dietary Restrictions',
    questions: [
      {
        question: 'Do you accommodate food allergies?',
        answer:
          'We take food allergies seriously and can accommodate most dietary restrictions. Please inform us of any allergies when ordering. Common allergens in our dishes include peanuts, fish, and shellfish.',
      },
      {
        question: 'Are your dishes gluten-free?',
        answer:
          'Many of our traditional dishes are naturally gluten-free, including our rice dishes, grilled meats, and most soups. However, some sauces and seasonings may contain gluten. Please ask about specific dishes when ordering.',
      },
      {
        question: 'Do you use peanuts in your cooking?',
        answer:
          'Yes, peanuts are used in several traditional dishes, particularly in our suya spice blend and some sauces. We can prepare most dishes without peanuts if you have an allergy - just let us know when ordering.',
      },
    ],
  },
];

export function FAQSection() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <HelpCircle className="h-6 w-6 text-orange-600" />
          Frequently Asked Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                {category.category}
              </h3>
              <div className="space-y-3">
                {category.questions.map((faq, questionIndex) => {
                  const itemId = `${categoryIndex}-${questionIndex}`;
                  const isOpen = openItems.includes(itemId);

                  return (
                    <div
                      key={questionIndex}
                      className="overflow-hidden rounded-lg border border-gray-200"
                    >
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100"
                      >
                        <span className="font-medium text-gray-900">
                          {faq.question}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="bg-white px-4 py-3">
                          <p className="leading-relaxed text-gray-600">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="text-center">
            <h4 className="mb-2 font-semibold text-gray-900">
              Still have questions?
            </h4>
            <p className="mb-4 text-gray-600">
              Can't find what you're looking for? We're here to help!
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="tel:+14165551234"
                className="rounded-md bg-orange-600 px-6 py-2 text-center text-white transition-colors hover:bg-orange-700"
              >
                Call Us: (416) 555-1234
              </a>
              <a
                href="mailto:info@africancuisine.ca"
                className="rounded-md bg-gray-600 px-6 py-2 text-center text-white transition-colors hover:bg-gray-700"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
