# ToolDaddy Project - Remaining Work

This document tracks the pending tasks and improvements for the ToolDaddy (Media Maestro) project.

---

## 🚀 High Priority: Mobile Dashboard Re-Architecture
Transform the mobile experience into a high-end, category-driven dashboard.

- [x] **Categorization**: Organize all 61+ tools into logical categories (Media, Security, AI Lab, Dev Utils).
- [x] **Jump Back In**: Enhance the "Recent Activity" row with high-fidelity cards and horizontal scrolling.
- [x] **Fixed Navigation**: Finalize the bottom navigation bar with vibrant icons and smooth transitions.
- [x] **Advanced Search**: Integrate global search to filter across all tool categories in real-time.
- [x] **Premium UI**: Implement Deep Navy/Black theme with subtle borders and shadows (no white boxes).

## 🛠️ High Priority: Bug Fixes & Tool Refinement
Fix reported issues in existing utilities.

- [x] **Simple Notepad**: Improve listing features (bulleted/numbered lists) and consider a fixed toolbar.
- [x] **Image Compressor**: Implement WebP/JPEG re-encoding to guarantee file size reduction (especially for PNGs).
- [x] **Hash Generator**: Debug and verify the SHA-256 implementation accuracy.
- [x] **MAC Address Lookup**: Fix API integration to reliably return manufacturer data.
- [x] **Bcrypt Generator**: Ensure cost factor limits are actually preventing browser hangs in all edge cases.

## 🔐 Medium Priority: Auth & Gamification
Fully realize the user identity and progression system.

- [ ] **OTP Verification**: Finalize the signup flow with secure email OTP verification.
- [ ] **User Profiles**: Link Hearts, XP, and Streaks to the Supabase database.
- [ ] **Stripe/Pro Integration**: (Future) Prepare foundations for potential premium feature usage.

## 💅 Low Priority: Polish & Performance
Fine-tuning the user experience and codebase.

- [ ] **Global Settings**: Make the settings button universally clickable to toggle persistence/themes.
- [ ] **Navigation Transparency**: Refine `backdrop-blur` and opacity levels across the site.
- [ ] **Dependency Update**: Resolve the `@next/swc` version mismatch in `package.json`.
- [ ] **SEO Expansion**: Add meta titles/descriptions to any smaller tools currently missing them.

---
*last Updated: February 13, 2026*
