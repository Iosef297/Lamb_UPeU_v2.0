# Contexto de sesión — Proyecto Lamb (continuar si se corta)

Fecha: 2026-10-23. Este archivo resume todo lo decidido hasta ahora para retomar en otra sesión sin perder contexto.

## 1. Repos involucrados

- **D:\CICLO V\MICROSERVICIOS\Modulo-02-Admision-a-Trayectoria** — repo personal del estudiante. 10 microservicios completos con S01-S10 implementado y verificado. **Se usa solo como referencia/fuente para copiar y portar código** — no se modifica más, solo lectura.
- **F:\SISTEMAS\Lamb_UPeU_v2.0** — repo de trabajo real (remote `AyniSyst/Lamb_UPeU_v2.0`, commits "Examen 01 Unidad"). **Acá se hace todo el trabajo de ahora en adelante.**

## 2. Alcance confirmado del proyecto en F:

- El proyecto en F: **no es solo "Admisión a Trayectoria"**, es **todo el sistema Lamb completo**.
- Se definieron **22 dominios** según `docs/proyecto-sello/acad.md` del repo `262dist/pagatu` (guía oficial del docente para dominio académico/universitario):
  1. Institucional, 2. Personas, 3. Admisión, 4. Currículo, 5. Planificación y Oferta Académica, 6. Matrícula, 7. Evaluación y Cierre Académico, 8. Trayectoria Académica, 9. Finanzas del Estudiante, 10. Egreso/Grados/Títulos, 11. Ingresos/Cobranza/Pagos, 12. Extensión/Educación Continua, 13. LMS, 14. Servicios al Estudiante, 15. Investigación, 16. Prácticas/Internado/Vinculación, 17. Movilidad e Internacionalización, 18. Egresados y Seguimiento, 19. Convenios y Relaciones Institucionales, 20. Biblioteca, 21. Analítica/Indicadores/BI, 22. Plataforma Transversal (seguridad/SSO).
- `acad.md` describe el **sistema legado actual** (monolitos modulares + solo 3 microservicios reales + integraciones externas tipo CRM/ERP/pasarela). **El docente pidió migrar lo máximo posible a microservicios** — por eso se decidió NO seguir la topología reducida de acad.md.
- **Decisión de topología confirmada**: TODOS los 22 dominios se construyen como **microservicios propios**, incluyendo los que acad.md marcaba como "externos" (Admisión, ERP Administrativo, Pasarela de pago) — el usuario quiere dejar de depender de servicios externos.
- **Aclaración importante dada al usuario**: una pasarela de pago real no se puede "reemplazar" de verdad (requiere banco/procesador real, PCI). Lo que se construye es un **simulador propio** de pasarela, no un procesador de pagos real.
- **Profundidad esperada**: TODOS los 22 microservicios con profundidad completa — mismo patrón que los 10 actuales (entity/repository/dto/mapper/service/controller/exception + Flyway + S01-S10: config centralizada, Eureka, Gateway, resiliencia, seguridad, mensajería, consistencia/sagas, observabilidad donde aplique).
- **Estimado de tiempo honesto dado al usuario**: 10-15 horas de trabajo efectivo repartidas en varias sesiones, NO en 1 hora (el usuario pidió "menos de 1 hora" para los 22, se le aclaró que no es realista y aceptó seguir por fases).
- **S11 (frontend Angular)**: queda para después, fuera del alcance inmediato — primero se termina backend al máximo.

## 3. Estado de F: antes de empezar a trabajar (línea base)

- 7 microservicios ya creados: `lamb-admision-ms`, `lamb-evaluacion-ms`, `lamb-finanzas-ms`, `lamb-institucional-ms`, `lamb-matricula-ms`, `lamb-personas-ms`, `lamb-planificacion-ms`.
- Esos 7 **solo tenían patrón S01-S04** (estructura base, Eureka, Config, Gateway). Las dependencias de Feign/Resilience4j/Kafka/Prometheus estaban en `pom.xml` pero **sin código real que las usara** (nada de S06-S10 implementado).
- Faltaban completos: `lamb-curriculo-ms`, `lamb-trayectoria-ms`.
- No existía `lamb-auth-ms` ni Keycloak — sin seguridad implementada.
- `infra/` (config, eureka, gateway) y `obs/` ya existían, similares a D:.
- Faltaba `kafka/` y `scripts/`.

## 4. Decisiones técnicas clave

- **Seguridad**: NO se copia `lamb-auth-ms` (JWT propio) de D:. Se construye **Keycloak desde cero** en F:, siguiendo la guía `S07b_Seguridad_Distribuida_Keycloak.md`.
- **`idPersona`**: en D: es la **PK real** (`Long`, `IDENTITY`) de la entidad `Persona` en `lamb-personas-ms`, usada en 6 servicios (admision, auth, evaluacion, finanzas, matricula, trayectoria). Al migrar a Keycloak, **`idPersona` debe quedar como *user attribute*/claim separado (Long)**, **NUNCA reemplazado por `sub` como String** — si se sigue la Parte C de S07b literal (que asume que el claim es un campo de negocio secundario, no la PK), se rompería la PK en cascada en 6 servicios. Esta es una divergencia intencional y ya confirmada.
- **Método de trabajo confirmado con el usuario**: se copia primero lo que sirve de D: (para ir rápido / ahorrar tiempo), pero **la fuente de verdad son las guías oficiales `.md` de sesión** (S01 a S11, descargadas de `262dist/pagatu`) — todo lo copiado de D: se revisa después contra esas guías y se corrige lo que no coincida. D: es punto de partida, no la referencia final.
- **Guías de sesión descargadas localmente** en:
  `C:\Users\iosef\AppData\Local\Temp\claude\D--CICLO-V-MICROSERVICIOS-Modulo-02-Admision-a-Trayectoria\a5215492-f902-45b6-953c-98adbb4d12be\scratchpad\sesiones\`
  (S01 a S11 + S12 + acad.md) — si se pierde esta carpeta temporal, volver a bajarlas con `gh api repos/262dist/pagatu/contents/docs/sesiones/<archivo>.md`.
- **Mapper faltante**: `lamb-trayectoria-ms` (y verificar los demás) necesitaba carpeta `mapper/` — pendiente de confirmar si ya se agregó.

## 5. Plan de trabajo (por bloques)

### Bloque 1 — COMPLETADO (compilación estática OK, falta verificación runtime)

Resultado real:
- Copiado tal cual de D: (ya cumplían guía): `kafka/`, `scripts/`, `lamb-curriculo-ms`, `lamb-trayectoria-ms` completos. `obs/` ya estaba sincronizado con D:.
- Portado S06-S09 (eventos, mensajería, Feign+CircuitBreaker, SecurityConfig, Flyway V2/V3) a los 3 servicios que estaban atrasados: `lamb-admision-ms`, `lamb-evaluacion-ms`, `lamb-planificacion-ms`. `lamb-finanzas-ms`, `lamb-institucional-ms`, `lamb-matricula-ms`, `lamb-personas-ms` ya estaban idénticos a D: — no se tocaron.
- Keycloak construido desde cero: `keycloak/compose-dev.yml` + `keycloak/import/lamb-realm.json` (realm `lamb`, roles ADMIN/COORDINADOR/DOCENTE/ESTUDIANTE, cliente `lamb-frontend` con PKCE S256, redirect `localhost:4200`, protocol mapper `idPersona` como user attribute Long — NO `sub`). 3 usuarios semilla con `idPersona` placeholder (1/2/3).
- Config-repo: `jwk-set-uri` → `issuer-uri` en gateway/admision/curriculo/evaluacion/planificacion/trayectoria. Gateway con rutas nuevas (curriculo, trayectoria, actas), ruta `lamb-auth-login` retirada.
- Mapper faltante en `lamb-trayectoria-ms` agregado (`TrayectoriaMapper` + DTOs) — de paso corrigió que el endpoint exponía entidades JPA crudas.
- Compilación verificada (`mvnw -DskipTests compile`): trayectoria, curriculo, admision, evaluacion, planificacion — todos OK. finanzas/institucional/matricula/personas no se tocaron ni recompilaron (no hacía falta).

**Pendiente de este bloque (decisión/trabajo del usuario):**
1. `idPersona` semilla en Keycloak (1,2,3) son placeholders — calzar con IDs reales de `lamb-personas-ms` antes de probar en serio.
2. No se corrió `docker compose up` end-to-end — solo compilación estática. Falta verificar runtime real: token real, rutas protegidas, eventos Kafka funcionando.
3. Monto de matrícula en finanzas es placeholder fijo (S$350) — falta consultar costo real a Core académico.
4. Sin commit de git todavía.

### Segunda pasada — COMPLETADA (ver más abajo)

El usuario pidió explícitamente completar S01-S10 en TODO lo que hay en F:, no solo lo que coincidía con D: (D: tampoco tenía seguridad individual por microservicio, solo Gateway — eso no cumple el requisito real de S07/S12: "cada microservicio debe validar el token, no solo el Gateway"). Se lanzó un segundo fork que hizo:

- **Seguridad (S07) agregada a los 4 que habían quedado sin tocar**: `lamb-finanzas-ms`, `lamb-institucional-ms`, `lamb-matricula-ms`, `lamb-personas-ms` — `SecurityConfig.java` + dependencia OAuth2 + `issuer-uri` en config-repo.
- **Hallazgo crítico corregido**: el Gateway NO tenía seguridad real — el `issuer-uri` estaba en YAML pero faltaba la dependencia OAuth2 en el pom, así que no validaba nada. Se agregó `SecurityConfig.java` completo con reglas `hasAnyRole` para TODAS las rutas (antes solo cubría las académicas).
- **S06 nuevo**: `lamb-matricula-ms` → `lamb-planificacion-ms` vía Feign+CircuitBreaker (valida sección ABIERTA, fallback no bloqueante si planificación cae).
- **S08/S09 nuevo**: Matrícula publica evento `matricula.confirmada` (Kafka) → Finanzas lo consume y genera `Pago` PENDIENTE de forma idempotente (constraint única `matricula_id`, no duplica si se reentrega el evento). Migración Flyway `V2__add_matricula_id_a_pagos.sql`. Idempotencia también en `confirmar()`/`anular()` de matrícula.
- Compilación verificada OK: matricula, finanzas, institucional, personas, gateway.

### Tercera pasada — COMPLETADA (re-auditoría de los 5 del primer fork)

Se re-auditó línea por línea S06-S10 en admision, curriculo, evaluacion, planificacion, trayectoria contra las guías oficiales (no contra D:, por la duda que dejó el hueco del Gateway). Resultado: **todo correcto, no hizo falta corregir nada** — dependencia OAuth2 real en los 5 poms, SecurityConfig con patrón "segunda línea" literal a S07, Feign+Resilience4j con config real en planificación, Kafka bootstrap-servers configurado en config-repo (no solo clases sueltas), constraints únicas + idempotencia + compensación de saga verificadas, Prometheus + CorrelationIdFilter en los 5, rutas de Gateway coinciden. Compilación OK en los 5.

## BLOQUE 1: COMPLETO Y VERIFICADO (9 microservicios académicos + Gateway + Keycloak, S01-S10 cumplido de verdad)

### Cuarta pasada — VERIFICACIÓN RUNTIME COMPLETADA

Se levantó el stack completo de verdad (no solo `mvnw compile`): 9 Postgres + Kafka + Keycloak + Config/Eureka/Gateway + 9 microservicios, todos registrados en Eureka.

**Bugs reales encontrados y corregidos:**
1. Eureka arrancaba en puerto 8080 (default) en vez de 18761 si se lanzaba antes que Config Server respondiera (`optional:configserver:...` degrada en silencio) — es un problema de **orden de arranque**, no de código: Config Server tiene que estar arriba y respondiendo ANTES de lanzar Eureka.
2. Keycloak 26: usuarios semilla en `lamb-realm.json` sin `firstName`/`lastName` + contraseñas en texto plano no se hashean en `--import-realm` → login fallaba ("Account is not fully set up"). Corregido: agregado firstName/lastName a los 3 usuarios, y creado `keycloak/import/seed-passwords.sh` (nuevo, idempotente, usa Admin REST API para fijar passwords post-boot).
3. Limitación de la máquina: levantar los 9 servicios en paralelo vía `mvnw` (Git-Bash/Cygwin) agota el subsistema `fork()` de Cygwin (no es RAM real). Solución: para varios a la vez, usar `mvnw.cmd` con `Start-Process` de PowerShell (proceso nativo) en vez de Git-Bash.

**Pruebas de seguridad con tokens reales** (vía Gateway): sin token→401, ADMIN→`/personas`→200, ESTUDIANTE→su matrícula→200, ESTUDIANTE→POST personas (solo ADMIN)→403, DOCENTE→`/pagos`→200. `idPersona` confirmado como claim separado del `sub` en el token real.

**Saga completa probada end-to-end**: plan de estudio→curso→sección (evento `seccion.abierta`)→evaluación auto-abre acta (`acta.abierta`)→sección ABIERTA (S06+S08+S09 real) → matrícula confirmada→evento `matricula.confirmada`→Finanzas crea Pago PENDIENTE automático (S/350, matriculaId=1) → repetido `confirmar` una 2da vez → **no duplicó el pago** (idempotencia real en ejecución).

**Datos de prueba creados** (quedan en las bases, sirven de demo): 3 personas (ids 1/2/3 calzadas con idPersona de Keycloak), 1 plan de estudio, 1 curso, 1 sección ABIERTA, 1 acta ABIERTA, 1 matrícula CONFIRMADA, 1 pago PENDIENTE.

**Estado actual: TODO EL STACK QUEDÓ CORRIENDO** (no se bajó, reiniciar cuesta ~15 min por Cygwin/orden de arranque). 4.4GB RAM libre de 16GB con todo arriba. Para bajarlo: `docker compose down` en cada carpeta (`keycloak/`, `kafka/`, cada `services/*/`) + matar procesos java (`Get-Process java | Stop-Process` en PowerShell).

## BLOQUE 1: COMPLETO, VERIFICADO EN CÓDIGO Y EN RUNTIME REAL

### Quinta pasada — obs/ construido desde cero + admision→trayectoria probado

**obs/ no existía en modo DEV** (ni en D: ni en F: — faltaba `compose-dev.yml`, solo había `prometheus-dev.yml` suelto sin nada que lo usara). Construido completo siguiendo S03/S04/S10:
- `obs/compose-dev.yml` (nuevo, puertos DEV: Prometheus 19090, Loki 13100, Grafana 13000 — distintos de PROD 29090/23100/23000)
- `obs/promtail/promtail-config-dev.yml` (nuevo) y fix de `promtail-config.yml` (le faltaban curriculo/trayectoria/gateway/keycloak)
- Prometheus (dev y prod): agregado target de Keycloak

**3 bugs reales corregidos:**
1. Gateway sin `logback-spring.xml` → creado.
2. Gateway exponía `prometheus` en config pero sin la dependencia Micrometer → 404 real en `/actuator/prometheus` → agregada, ahora 200.
3. Grafana en crash loop por 2 datasources duplicados marcados `isDefault: true` → corregido (borrado el duplicado).

**Resultado**: Prometheus 10/10 targets UP (9 microservicios+Gateway+Keycloak), Loki recibiendo logs reales, Grafana con 2 dashboards cargando. URLs reales (DEV, no las de PROD): Prometheus `localhost:19090`, Loki `localhost:13100`, Grafana `localhost:13000` (admin/admin).

**Flujo admision→trayectoria probado end-to-end**: facultad→programa→postulación(idPersona=3)→evaluar(18.0)→admitir→evento Kafka→trayectoria creada automática ACTIVO. Reintento de `admitir` misma postulación → 409 Conflict (máquina de estados bloquea antes de repetir el evento — idempotencia válida pero distinta a la de matrícula→finanzas, que sí probó reentrega real de Kafka).

**Estado actual: 17 contenedores + 12 procesos Java corriendo.**

## BLOQUE 1: 100% COMPLETO Y VERIFICADO (código + runtime + observabilidad + las 2 sagas principales probadas)

**Pendiente real:**
1. **Sin commit de git** — hay bastantes archivos modificados sin commitear de las 5 pasadas (correr `git status` en F: antes de commitear para ver la lista completa).
2. Monto de matrícula en finanzas sigue siendo placeholder fijo (S$350) — falta consultar costo real a Core académico.
3. Idempotencia de reentrega real de Kafka (no solo bloqueo de máquina de estados) solo se verificó en matricula→finanzas, no en admision→trayectoria.

### Bloque 2 — PENDIENTE (no empezado)
Construir los **12 dominios nuevos** sin código existente, completos (mismo nivel que los 10 anteriores):
- Extensión/Educación Continua (12), LMS (13), Servicios al Estudiante (14), Investigación (15), Prácticas/Internado/Vinculación (16), Movilidad e Internacionalización (17), Egresados y Seguimiento (18), Convenios y Relaciones Institucionales (19), Biblioteca (20), Analítica/BI (21), Ingresos-Cobranza-Pagos más allá de Finanzas (11, acotado a "Pagos en línea" — simulador propio, no pasarela real), ERP Administrativo (parte de "Administrativo — externo" en acad.md, pero el usuario quiere construirlo propio también).
- `acad.md` solo da 1 línea de descripción por dominio — hay que **diseñar el modelo de datos de cada uno** antes de construir (no hay spec detallada como sí la hay para los 10 académicos).
- No arrancar este bloque hasta terminar y verificar el Bloque 1.

### Bloque 3 — PENDIENTE
S11: integración frontend Angular + Keycloak. Explícitamente pospuesto hasta terminar backend.

## 6. Cómo retomar esta sesión

1. Leer este archivo completo primero.
2. Revisar el estado real de `F:\SISTEMAS\Lamb_UPeU_v2.0` (qué se alcanzó a hacer del Bloque 1) comparando contra la sección 5 de arriba.
3. Si el Bloque 1 quedó incompleto, continuar desde donde se cortó — no repetir desde cero lo que ya esté hecho y compilando.
4. Si el Bloque 1 ya está completo y validado, seguir con el Bloque 2, dominio por dominio (no los 12 de una vez).
5. Mantener la misma regla: las guías `.md` de sesión mandan sobre lo que ya exista copiado de D:.

## 7. Sesión 2026-11-05 — Fusión de frontends

**Contexto**: existía un segundo repo de pruebas, `F:\PRUEBA 3 XD\Admision_Trayectoria_Lamb` (NO es el repo de trabajo, solo fuente de diseño), con un frontend Angular nuevo (shell/home, wizard de postulación con RENIEC+email, CRUD genérico data-driven de 14 entidades Admisión/Trayectoria vía `cruds.catalog.ts`) y backend con `PostulacionWizardController/Service`, `ReniecController/Service`, `EmailService` (Resend) en `services/lamb-admision-ms` de ESE repo.

**Se hizo** (todo dentro de `F:\SISTEMAS\Lamb_UPeU_v2.0\clients\lamb-frontend`, nada fuera de esa carpeta, nada en el repo de pruebas):
- El diseño/estructura del frontend de pruebas (shell, home, wizard, CRUD genérico) se volvió la base oficial del frontend de este repo.
- Se preservó TODA la lógica propia que ya tenía este frontend: los 10 módulos de negocio (facultades, programas, cursos, grupos, planes-estudio, matriculas, notas, actas, pagos, personas) se portaron tal cual (services/modelos/components sin cambios de lógica) y quedaron enlazados en el sidebar nuevo.
- Auth PKCE propio de este repo (`core/auth/*`) se mantuvo — reemplazó al `keycloak-js` que traía el frontend de pruebas.
- `environment.ts` unificado a `apiBaseUrl` (antes el frontend de pruebas usaba `apiUrl` — se corrigió `core/api.service.ts` para usar `apiBaseUrl`).
- Se agregó `@angular/animations` (faltaba, requerida por Material/animations async, causaba error de build) y se quitó `keycloak-js` (ya no se usa).
- Código muerto eliminado: `features/microservicios/*` (CRUD genérico viejo), `core/layout/*` (layout viejo).
- `npm install` + `npx ng build` verificados OK, 0 errores (solo warnings preexistentes inofensivos).

**⚠️ IMPORTANTE — PENDIENTE CRÍTICO DE SEGURIDAD**:
Por pedido explícito del usuario, se **quitó temporalmente el `authGuard`/`rolGuard` de TODAS las rutas** en `src/app/app.routes.ts` (antes algunas rutas del área de Admisión/Trayectoria ya no lo tenían por un descuido de la fusión, y se decidió quitarlo de todas por ahora para poder navegar/probar sin login).
**Ahora mismo NINGUNA ruta pide autenticación.** Esto es temporal para poder trabajar/probar el frontend fusionado sin friction de login.
**ANTES DE CERRAR ESTE TRABAJO / IR A PRODUCCIÓN: hay que volver a poner `canActivate: [authGuard]` (y los `rolGuard`/`GESTION` correspondientes por ruta) en `app.routes.ts`.** Está documentado tal cual estaba antes en este mismo archivo de contexto (sección de rutas con guards, ver git history o el reporte de la fusión) — se puede restaurar comparando con `git diff` de ese archivo si no se recuerda el detalle exacto.

También se desactivó el redirect automático a Keycloak en `core/auth/auth-interceptor.ts`: antes, cualquier respuesta 401 del backend disparaba `auth.iniciarLogin(...)` y mandaba al navegador a la pantalla de login de Keycloak aunque la ruta no tuviera guard (por eso aparecía el login igual tras quitar los guards — lo disparaba el interceptor, no el router). Ahora un 401 solo deja pasar el error (sin redirect). **Hay que revertir este cambio también** al reactivar el auth: volver a llamar `auth.iniciarLogin(location.pathname)` dentro del `if (!token)` del interceptor.

También se desactivó la seguridad en el Gateway (`infra/lamb-gateway/.../SecurityConfig.java`): el frontend sin login seguía recibiendo 401 reales del Gateway (`anyRequest().authenticated()`), porque ahí la protección es independiente del frontend. Se cambió a `.anyRequest().permitAll()` y se dejaron **comentadas** (no borradas) todas las reglas `hasAnyRole`/`authenticated` originales justo debajo, para restaurar tal cual estaban. **Hay que recompilar y reiniciar el Gateway** para que este cambio tome efecto (no es hot-reload como el frontend). Al reactivar el auth: descomentar el bloque original y borrar la línea `.anyRequest().permitAll()` + el comentario TEMPORAL.

Además se encontró que faltaban rutas en el Gateway (`infra/lamb-config/config-repo/lamb-gateway-dev.yml`): solo estaban ruteados `/api/v1/postulaciones/**` (admision) y `/api/v1/trayectorias/**` (trayectoria), pero el frontend fusionado usa 14 entidades del catálogo CRUD genérico (`cruds.catalog.ts`). Se agregaron las rutas faltantes hacia `lamb-admision-ms` (convocatorias, postulantes, inscripciones, examenes-admision, seguimientos, calificaciones, adjudicaciones, casos-especiales, tipos-documento, modalidades-admision) y hacia `lamb-trayectoria-ms` (cumplimientos-requisito, alertas-riesgo, tutorias, reconocimientos, egresos). Los controllers ya existían en ambos microservicios, solo faltaba el ruteo. Como es config-repo (config server), no requiere recompilar el Gateway, solo reiniciarlo (o `/actuator/refresh` si está habilitado) para que tome las rutas nuevas.

**Segunda capa de seguridad encontrada y desactivada (cada microservicio, no solo el Gateway)**: después de desactivar la seguridad del Gateway y arreglar las rutas, el 401 en `/api/v1/convocatorias` seguía apareciendo. Causa: CADA microservicio tiene su propio `SecurityConfig.java` (`oauth2ResourceServer` independiente) que exige JWT válido sin importar lo que permita el Gateway — es una segunda línea de defensa documentada en el propio comentario del Gateway ("la valida cada microservicio por su cuenta"). Se aplicó el mismo cambio temporal (`anyRequest().permitAll()`, reglas originales comentadas debajo, no borradas) en los `SecurityConfig.java` de los **11 microservicios**: `lamb-admision-ms`, `lamb-trayectoria-ms`, `lamb-ingresos-pagos-ms`, `lamb-planificacion-ms`, `lamb-matricula-ms`, `lamb-finanzas-ms`, `lamb-evaluacion-ms`, `lamb-curriculo-ms`, `lamb-institucional-ms`, `lamb-personas-ms`, `lamb-lms-ms`. **Cada uno requiere recompilar y reiniciar ese microservicio** (no hot-reload) para que el cambio tome efecto. **Al reactivar el auth: en cada uno de estos 11 archivos, descomentar el bloque original (`requestMatchers(...).permitAll()` + `anyRequest().authenticated()`) y borrar `.anyRequest().permitAll()` + el comentario TEMPORAL.**

**`tieneRol()` siempre `true` temporalmente** (`core/auth/auth-service.ts`): con el login desactivado no hay token/roles, así que `auth.tieneRol('ADMIN', 'COORDINADOR')` devolvía `false` en todos lados y ocultaba botones de "Nuevo/Agregar", columnas de "Acciones" (editar/eliminar) en las páginas con lógica propia (ej. Personas) que gatean esos controles por rol. Se cambió `tieneRol()` para devolver `true` siempre, con la lógica real comentada debajo. **Al reactivar el auth: borrar el `return true;` y descomentar la lógica real.**

**Módulos Institucional y Personas agregados al frontend (PERMANENTE, no es bypass temporal)**: a pedido del usuario, `lamb-institucional-ms` y `lamb-personas-ms` ahora aparecen en el sidebar como módulos completos, replicando exactamente el mismo patrón de catálogo CRUD genérico que ya usaban Admisión y Trayectoria (un solo componente `crud-generic` + un array `CrudDef[]` que lo configura todo), no el patrón de componentes dedicados de "destino". Se cubrió **todos los sub-recursos** de ambos microservicios: cada endpoint GET/POST/PUT/DELETE de cada controller se convirtió en su propia entrada `CrudDef` — **46 entradas de Institucional + 50 de Personas = 96 entradas nuevas** (slugs prefijados `inst-`/`per-` para evitar choques, ej. dos "facultades" y tres "tipos-documento" distintos). Archivos tocados:
  - `clients/lamb-frontend/src/app/features/cruds.catalog.ts`: tipo `CrudDef.group` ampliado a `'Admisión' | 'Trayectoria' | 'Institucional' | 'Personas'`; se agregaron las 96 entradas nuevas al array `CRUDS` (total 111 entradas).
  - `clients/lamb-frontend/src/app/layout/shell.component.ts`: `ModuleKey` ampliado; se agregaron computeds `institucional`, `personas`, `showInstitucional`, `showPersonas`.
  - `clients/lamb-frontend/src/app/layout/shell.component.html`: dos bloques nuevos de `nav-group` (Institucional, Personas) con `@for` sobre el catálogo filtrado, más dos links de fallback en el bloque "Módulos" cuando no hay módulo activo.
  - `infra/lamb-config/config-repo/lamb-gateway-dev.yml` y `-prod.yml`: se agregaron las rutas del Gateway faltantes para los 9 base-paths de Institucional (`/api/v1/facultades`, `/api/v1/programas`, `/api/v1/calendario`, `/api/v1/campus-sede`, `/api/v1/facultad-escuela`, `/api/v1/institucion`, `/api/v1/parametro-auditoria`, `/api/v1/periodo-academico`, `/api/v1/programa-academico`) y los 6 de Personas (`/api/v1/persona`, `/api/v1/relacion-responsable`, `/api/v1/documento-persona`, `/api/v1/identificacion`, `/api/v1/contacto-direccion`, `/api/v1/datos-personales`) — antes solo existían rutas explícitas para `/api/v1/facultades`, `/api/v1/programas` y `/api/v1/persona` (dev) / `/api/v1/personas` (prod, con un typo preexistente en plural que no se tocó). No se modificó nada de Admisión/Trayectoria/Gestión académica — trabajo puramente aditivo. `npx tsc --noEmit` pasó limpio tras los cambios en el frontend.

**Pendiente adicional**:
- Backend de destino (`services/lamb-admision-ms` de este repo) todavía NO tiene los endpoints nuevos (`PostulacionWizardController`, `ReniecController`, `EmailService`) — solo existen en el backend del repo de pruebas. El wizard/RENIEC del frontend fusionado va a fallar (404) contra el backend de este repo hasta portar esa lógica de backend también.
- `public/silent-check-sso.html` quedó huérfano (del keycloak-js viejo), no rompe nada pero se puede borrar.

## 8. Sesión 2026-11-05 (continuación) — Pulido UI Institucional/Personas

**Se hizo**:
- `cruds.catalog.ts`: agregado campo opcional `subgroup?: string` a `CrudDef` (solo organiza sidebar, no afecta la página CRUD). Las 46 entradas de Institucional se agruparon en 7 subgrupos (Programa académico, Periodo académico, Parámetros y auditoría, Institución, Campus y sede, Facultad y escuela, Calendario académico) y las 50 de Personas en 6 (Relación y responsables, Persona, Documentos de persona, Identificación, Contacto y dirección, Datos personales) — cobertura 1:1 verificada (46+50).
- `shell.component.ts`: agregado `agrupar()` (computed que bucketiza por `subgroup`), `institucionalGrouped`/`personasGrouped`, y manejo de apertura/cierre por subgrupo vía `Map<string, boolean>` de overrides (`undefined` = usa default: abierto si contiene el slug activo; override explícito del usuario tiene prioridad).
- `shell.component.html`: ambos bloques planos (Institucional/Personas) reemplazados por acordeón anidado (botón subgrupo + lista condicional de items).
- `shell.component.scss`: estilos nuevos `.nav-subgroup`/`.nav-item--sub` + soporte modo colapsado.
- Bug fix: el acordeón no colapsaba si contenía el item activo (ej. "Programa académico", "Persona") — el default forzaba `true` sin mirar el toggle del usuario. Corregido con el patrón de overrides de arriba.
- Fix de ícono: "Relación familiar" usaba `diversity_3`, casi idéntico visualmente a `family_restroom` de "Tipo de parentesco" en tamaño sidebar — cambiado a `groups` (ambos confirmados con `npx tsc --noEmit`, exit limpio).
- Se revisó que `TipoParentesco`/`RelacionFamiliar` NO son lógica duplicada a nivel de datos: `TipoParentesco` es catálogo (`id`,`nombre`), `RelacionFamiliar` es tabla transaccional con FK a ese catálogo (`id_persona`, `id_persona_relacionada`, `id_tipo_parentesco`, `fecha_registro`). Separación correcta a nivel de tablas/backend — no tocar eso.

**PENDIENTE — pedido explícito del usuario, NO hecho todavía**:
Fusionar en la UI (solo frontend, no backend) las pantallas `per-tipos-parentesco` ("Tipo de parentesco") y `per-relaciones-familiares` ("Relación familiar") del catálogo Personas en **una sola entrada de sidebar** con tabs internas (ej. "Relaciones" / "Tipos"), para comodidad — no fusionar tablas/entidades de backend (eso rompería normalización, confirmado con el usuario). El componente genérico `crud-generic` actual no soporta tabs — hay que ver si conviene:
  (a) extender `crud-generic` con un modo "tabs" opcional sobre 2+ `CrudDef`, o
  (b) crear un componente dedicado nuevo solo para este caso.
Aplicar el mismo criterio "fusionar en UI para comodidad" a cualquier otro par catálogo/transacción similar dentro de Institucional o Personas si aplica (ej. revisar si hay otros pares tipo-catálogo + tabla-que-lo-usa en los 96 CRUDs nuevos antes de dar por terminado).

**Todavía sin resolver, re-confirmar con el usuario al retomar**:
- Gateway: las rutas de Institucional/Personas en `lamb-gateway-dev.yml` están bien definidas (confirmado leyendo el archivo completo), pero el Gateway corriendo no las recargó (Spring Cloud Config no hace hot-reload sin restart/`/actuator/refresh`) → sigue dando 404 "No static resource" en `/api/v1/programa-academico/menciones-especialidad` y probablemente en el resto de rutas nuevas. Pregunté al usuario si reiniciar el servicio — no respondió, quedó pendiente.

---

## Sesion 2026-11-16 (regimen<->modalidad multiref + fixes)

**Backend**:
- Fix `V14__regimen_modalidad.sql` (lamb-institucional-ms): seed cambiado de IDs hardcodeados a `INSERT...SELECT...WHERE nombre='...' ON CONFLICT DO NOTHING` (match por nombre, no id) pq Modular habia sido borrado via CRUD y rompia FK. Compilado ok (`mvnw.cmd -q -o compile`).
- Pendiente confirmar: usuario reinicio lamb-institucional-ms tras el fix? Si Flyway quedo con fila `success=false` en `flyway_schema_history` de intento previo fallido, puede necesitar `flyway:repair` o borrar esa fila a mano.

**Frontend (crud-generic + cruds.catalog.ts)**:
- Campo `__modalidades` (multiref) en regimenes-academicos: `listed: false` -> `true` para mostrar en tabla.
- `crud-generic.component.ts`: nuevo signal `multiRefColumnIds`, metodo `loadMultiRefColumns(d)` (carga join rows por campo, mapea ownerId->valueIds[]), llamado en `load()`. Helper `multiRefLabels(row, field)`. `fmtCell` extendido con rama `multiref`.
- Fix bug: tabla mostraba "—" en fila recien creada porque `syncMultiRefFields` no actualizaba `multiRefColumnIds` tras guardar. Fix: update optimista del signal al final del loop de sync.
- `inst-programa-sede`: campos `idPrograma`/`idSede` eran `number` plano, usuario pidio dropdown. Cambiados a `type: "ref"` con `refPath: "/api/v1/programas"` y `/api/v1/campus-sede/sedes"` resp., `refLabelKey: "nombre"`.
- Quitado subtitulo descriptivo de regimenes-academicos (usuario pidio "borra eso de abajito"). CUIDADO: `description` es campo requerido en interfaz `CrudDef` (`description: string`) — no se puede borrar la key, solo poner `description: ""`, sino rompe build (`TS2741`) y `ng serve` queda sirviendo bundle viejo (parece que "no cambio nada" pero en realidad build fallo).

**Nota tecnica recurrente**: `cruds.catalog.ts` tiene encoding mixto (algunos acentos como texto escapado tipo `\u00e9`, otros UTF-8 multibyte crudo) — rompe `Edit` tool por exact-match en ciertas lineas. Workaround: `sed -i 'N d'` / `sed -i 'Na\...'` por numero de linea cuando `Edit` falle por esto.

**Sin confirmar al cierre de esta sesion**: reinicio ok de institucional-ms, prueba de guardado en programa-sede con los nuevos dropdowns, recarga visual del subtitulo quitado.
