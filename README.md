# Honda Showroom Showcase

Build a modern, premium, responsive website for a Honda two-wheeler showroom.

IMPORTANT:

This is a showroom portfolio/catalogue website, not an e-commerce website.

Do not add online purchasing, checkout, payment, customer accounts, or unnecessary complex features.

For now, use realistic DEMO DATA for all vehicles, images, descriptions, prices, offers, showroom information, etc. The actual showroom content will be provided later.

The website should be designed so that the demo content can easily be replaced with real showroom content.

==================================================

PROJECT PURPOSE

==================================================

The website's purpose is to:

1. Showcase the Honda two-wheelers available at the showroom.

2. Organize vehicles by category.

3. Show individual vehicle/model information.

4. Show whether vehicles are currently available at the showroom.

5. Display current showroom offers/promotions.

6. Make it very easy for visitors to contact the showroom through phone, WhatsApp, email, or an enquiry form.

7. Present the showroom as a professional and trustworthy local Honda dealership.

The main user journey should be:

Home → Browse Vehicles → View Vehicle → Check Availability → Contact Showroom

==================================================

DESIGN DIRECTION

==================================================

Create a clean, modern automotive/dealership design.

The design should feel:

- Professional

- Premium

- Modern

- Trustworthy

- Clean

- Easy to navigate

Use Honda-inspired visual styling, but do not create a direct copy of Honda's official website.

Use a strong red/white/black visual language inspired by Honda branding, with plenty of whitespace.

Use high-quality motorcycle/scooter imagery throughout the design.

Use large vehicle photography, clean typography, subtle shadows, rounded cards where appropriate, and tasteful animations.

Avoid:

- Overly flashy animations

- Excessive gradients

- Cluttered layouts

- Generic SaaS-style design

- E-commerce shopping cart UI

- Excessive glassmorphism

The website should feel like a real professional dealership website rather than a template.

==================================================

PAGES

==================================================

Create the following main pages:

1. Home

2. About Showroom

3. Vehicles / Catalogue

4. Individual Vehicle Details

5. Offers

6. Contact Us

==================================================

HOME PAGE

==================================================

Create a strong hero section with:

- Large Honda two-wheeler image

- Short headline

- Short showroom description

- Primary CTA: "Explore Vehicles"

- Secondary CTA: "Contact Us"

Example demo headline:

"Find Your Perfect Honda Two-Wheeler"

Example supporting text:

"Explore Honda scooters and motorcycles available at our showroom. Check models, variants and availability, and get in touch with our team."

Below the hero:

1. Featured Vehicles

2. Vehicle Categories

3. Current Offers

4. Why Choose Our Showroom

5. About the Showroom

6. Contact CTA

7. Footer

==================================================

VEHICLE CATEGORIES

==================================================

Create category-based browsing.

Use demo categories such as:

- Scooters

- Motorcycles

The category section should use attractive visual cards.

Each category should lead to the vehicle catalogue filtered by that category.

==================================================

VEHICLE CATALOGUE

==================================================

Create a catalogue page displaying vehicle cards.

Each card should show:

- Vehicle image

- Model name

- Category

- Short description

- Starting price if available

- Availability status

- "View Details" button

Use realistic DEMO Honda models and realistic placeholder/demo information.

For example:

Scooters:

- Activa 6G

- Activa 125

- Dio

Motorcycles:

- Shine 100

- Shine 125

- SP 125

- Unicorn

Do not claim that these are the showroom's actual available vehicles. Clearly treat them as demo content.

Include filtering by category.

Make the catalogue visually polished and easy to browse on mobile.

==================================================

INDIVIDUAL VEHICLE PAGE

==================================================

Create a detailed page for each vehicle.

Include:

- Large vehicle image/gallery

- Model name

- Category

- Short description

- Price

- Variants

- Available colours

- Key specifications/features

- Availability status

- Contact/Enquire CTA

- WhatsApp CTA

- Call CTA

The availability should be visually obvious.

Example:

"Available at Showroom"

or

"Currently Unavailable"

Do not include an Add to Cart button.

The main purpose is to encourage the visitor to contact the showroom.

==================================================

OFFERS

==================================================

Create an Offers/Promotions section and dedicated Offers page.

Use realistic DEMO offers for now.

Each offer should contain:

- Offer title

- Short description

- Applicable vehicle

- Benefit/discount

- Validity

- CTA

Example:

"Special Monsoon Offer"

"Special benefits on selected Honda scooters."

"Available for selected models."

Clearly treat all offers as demo content.

The UI should be designed so offers can later be added, edited and removed through the admin panel.

==================================================

ABOUT SHOWROOM

==================================================

Create a professional About page.

Use DEMO showroom information for now.

Include:

- Showroom introduction

- Short history

- Customer-focused message

- Why choose this showroom

- Showroom image

- Location/contact CTA

Keep the content realistic but clearly replaceable later.

==================================================

CONTACT PAGE

==================================================

Create a dedicated Contact Us page.

Include:

- Phone

- WhatsApp

- Email

- Address

- Business hours

- Google Maps section

- Contact/enquiry form

The enquiry form should contain:

- Name

- Phone number

- Email

- Interested vehicle

- Message

Include clear success/error states.

The primary purpose is to generate enquiries, not create user accounts.

==================================================

ADMIN PANEL

==================================================

Create a separate protected admin dashboard.

The admin panel is for the showroom staff to manually manage website content.

Include:

Dashboard

Vehicles:

- Add vehicle

- Edit vehicle

- Delete vehicle

- Update vehicle information

- Update availability

Offers:

- Add offer

- Edit offer

- Delete offer

- Activate/deactivate offers

Enquiries:

- View submitted enquiries

- View enquiry details

Admin authentication:

- Login page

- Protected admin routes

- Logout

The admin panel should be clean and simple enough for a non-technical showroom employee to use.

==================================================

DYNAMIC CONTENT

==================================================

Vehicle information, availability and offers are dynamic content.

The public website should display data from the same underlying data source used by the admin panel.

For development, populate the system with DEMO DATA.

The admin should be able to later replace the demo vehicles and offers with the showroom's real information without changing the website code.

Do not build live Honda inventory integration.

Availability is manually managed by the showroom through the admin panel.

==================================================

RESPONSIVE DESIGN

==================================================

The website must be fully responsive.

Pay particular attention to mobile because many showroom customers will visit from their phones.

Ensure:

- Mobile navigation

- Responsive vehicle cards

- Proper image sizing

- Touch-friendly buttons

- Readable typography

- Mobile-friendly enquiry form

- Sticky or easily accessible Call/WhatsApp actions where appropriate

==================================================

SEO & PERFORMANCE

==================================================

Use basic SEO best practices:

- Proper page titles

- Meta descriptions

- Semantic HTML

- Proper heading hierarchy

- Image alt text

- SEO-friendly vehicle URLs

Optimize images and avoid unnecessary heavy animations.

==================================================

TECHNICAL STRUCTURE

==================================================

Build this as a real full-stack application rather than a static mockup.

Use:

- Modern responsive frontend

- Backend/API

- Database for vehicles, availability, offers and enquiries

- Authentication for admin

- Clean reusable components

- Proper loading, empty and error states

Keep the architecture simple and maintainable.

Do not over-engineer the project.

==================================================

DEMO CONTENT

==================================================

Populate the entire website with realistic demo data so the website looks complete immediately.

Use demo:

- Showroom name

- Address

- Phone

- Email

- Images

- Vehicle models

- Vehicle descriptions

- Specifications

- Variants

- Colours

- Prices

- Availability

- Offers

- About text

Make it visually obvious in the code/data structure that this is demo content so it can be replaced later.

==================================================

FINAL UX GOAL

==================================================

The website should make a visitor immediately understand:

"This is a Honda two-wheeler showroom."

"These are the vehicles they offer."

"These are the vehicles currently available."

"These are their current offers."

"Here is how I can contact them."

Prioritize visual quality, clarity, trust and ease of contact.

Do not add unnecessary functionality outside this scope.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://premium-two-wheel.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ec0b1505-a59e-46fa-a309-ca1d9b744edc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
