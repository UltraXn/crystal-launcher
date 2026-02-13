# 📋 Tareas Actuales - CrystalTides SMP

## 🛠️ En Progreso

- [x] **Hotfix Layout Mantenimiento**: Logo y layout en `Maintenance.tsx` [ID: FIX-001] ✅
- [x] **Depuración CI/CD & Consola**: Resolver fallos en GitHub Actions, limpiar CSP/Permissions-Policy y errores de GSAP/Three.js [ID: CI-001] ✅

## 📌 Deuda Técnica / Pendiente

- [ ] Verificar consistencia de `task.md` vs `docs/roadmap/TODO.md`
- [ ] **Restauración de Tests Unitarios**: Reemplazar `smoke.test.ts` con tests reales migrados de las versiones anteriores.
- [x] Persistent Navigation Refactor
  - [x] Convert `MainLayout` to a Shell/Navigator structure
  - [x] Update `AuthWrapper` to return the ShellLayout
  - [x] Adjust `HomePage`, `SettingsPage`, and `ProfileSelectionPage` for nested layout
  - [x] Verify sidebar persistence and state management

## ✅ Completado

- [x] **Sincronización de Ramas**: Merge de `dev` a `main` completado [ID: SYNC-001]
  - [x] Pull de `dev`
  - [x] Cambio a `main` e intento de merge
  - [x] Resolución de conflictos (7 archivos resueltos adoptando estándares de `dev`)
    - [x] `.gitignore`
    - [x] `GamificationManager.tsx`
    - [x] `PollFormModal.tsx`
    - [x] `StaffList.tsx`
    - [x] `CreateTicketModal.tsx`
    - [x] `TicketDetailModal.tsx`
    - [x] `PremiumConfirm.tsx`
  - [x] Push a `main`
- [x] **CI Quality Check**: Verificación exitosa de Lint y Build en Client, Server y Shared
- [x] Stash de cambios locales en `fix/maintenance-page-layout`
