# 🚀 @tdev/toolkit

**A modular Full Stack development toolkit built and maintained by [Thalys Dev](https://github.com/thalys93)**  
Designed to boost productivity, enforce architecture consistency, and accelerate development across multiple projects.

---

## 🧠 Why this toolkit?

In modern development, reusability and scalability are king. `@tdev/toolkit` is crafted to provide plug-and-play modules that abstract essential services and boilerplate logic — so you can focus on what really matters: building great products.

---

## 🧩 Toolkit Modules

Each module is standalone, configurable, and integration-ready:

- 🔒 **Auth Module**  
  Seamless user authentication with strategies like JWT, OAuth, and more.

- 💳 **Payment Module**  
  Abstracts payment gateway logic (e.g. Mercado Pago, Stripe) with support for subscriptions and transactions.

- 📧 **Email Module**  
  Plug-and-play transactional emails with provider flexibility (SMTP, SendGrid, etc).

- 🔔 **Notifications Module**  
  Real-time and scheduled notifications via multiple channels (email, push, in-app).

- 📁 **Files Module**  
  File uploads, storage, and media handling with services like Cloudinary and S3.

- 👤 **Users Module**  
  Core user management, profiles, roles, and permissions.

> ✨ New modules will be added progressively — ideas like Logging, Analytics, and External Integrations are already brewing.

---

## 🔧 Core System Check

The `core` module includes health checks for connected services. When initializing your app, it verifies that third-party services (like Cloudinary, SMTP, etc.) are properly configured and responsive.

Example:

```bash
npm run system-check

Output: will list available services and highlight any misconfigurations or connectivity issues.
````

📦 Getting Started

1. Clone the repo:
```bash
git clone https://github.com/thalys93/tdev_toolkit.git
```

2. Install dependencies:
```bash
npm install
```

3. Add your .env file based on .env.example

4. Run in dev mode:
```bash
npm run start:dev
```

🤝 Contributing
----
This toolkit is created for personal usage, but contributions, suggestions or feedback are welcome! If you find a bug or want to propose a module, feel free to open an issue or submit a PR

🧬 License
----
MIT — feel free to fork, modify and use it in your own adventures.

💬 Author
----
Crafted with ❤️ by Thalys Dev


Let’s build **smarter**, not harder.