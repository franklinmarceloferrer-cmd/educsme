---
alwaysApply: true
---
# Programming Best Practices Guide

## 1. Code Organization
- **Structure by responsibility** (e.g., Controllers, Services, Repositories, Models).  
- **Use clear and consistent names** for classes, methods, and variables.  
- **Keep functions small** — each method should do **only one thing** (Single Responsibility Principle).  
- **Organize folders and namespaces** logically (e.g., `EduCms.Data.Models`, `EduCms.Web.Controllers`).  

---

## 2. Style and Conventions
- **Class and method names** → PascalCase (`AnnouncementController`, `GetAllAnnouncements`).  
- **Variable and parameter names** → camelCase (`announcement`, `dbContext`).  
- **Constants** → UPPER_CASE (`MAX_RETRY_COUNT`).  
- **Indentation** → 4 spaces (or team standard).  
- **Comments** → only when necessary; clean code should be self-explanatory.  

---

## 3. Quality and Maintainability
- **DRY (Don’t Repeat Yourself)** → avoid code duplication, reuse functions.  
- **KISS (Keep It Simple, Stupid)** → prefer simple solutions over complex ones.  
- **YAGNI (You Aren’t Gonna Need It)** → don’t implement unused features yet.  
- **Error handling** → use specific exceptions and meaningful messages.  
- **Logging** → record key events and errors for debugging.  

---

## 4. Database Best Practices
- **Use migrations** for schema versioning.  
- **Avoid hardcoded SQL** → use ORMs like EF Core.  
- **Prevent SQL Injection** with parameterized queries.  
- **Validate input data** before saving to the database.  

---

## 5. Testing
- **Automate unit tests** (xUnit, NUnit, MSTest).  
- **Cover critical scenarios** (login, business rules, CRUD).  
- **Use mocks** to isolate external dependencies (DB, APIs).  
- **CI/CD integration** → run tests on every commit.  

---

## 6. Security
- **Never expose secrets/passwords** in code (use `appsettings.json` + secrets or environment variables).  
- **Validate all user inputs**.  
- **Always use HTTPS**.  
- **Access control** → implement roles and permissions.  
- **Update dependencies** regularly to avoid vulnerabilities.  

---

## 7. Collaboration and Git
- **Small, clear commits** → use messages like `feat:`, `fix:`, `docs:`.  
- **Well-named branches** → `feature/login`, `fix/bug-123`.  
- **Pull Requests** → request reviews before merging into `develop` or `main`.  
- **Documentation** → keep README and docs up to date.  

---

## 8. Performance and Maintainability
- **Use async/await** for I/O operations.  
- **Avoid loading unnecessary data** (use projections in LINQ).  
- **Cache when possible** (in-memory, Redis).  
- **Refactor heavy methods** to reduce complexity.  

---

## 9. Documentation
- **Updated README** with setup instructions.  
- **XML comments** for public methods (when useful).  
- **Architecture docs** to explain system design decisions.  
- **Usage examples** for APIs (if exposed).  

---

## 10. Team Culture
- **Code Review** is for learning, not punishment.  
- **Respect team standards** (lint, style, guidelines).  
- **Clear communication** in issues and PRs.  
- **Automation** → scripts for build, test, deploy.  

---

✅ Following these practices ensures your codebase is **clean, secure, maintainable, and scalable**.

