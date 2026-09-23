# Port Allocation Convention

To ensure deterministic local development and prevent collisions across multiple servers running concurrently within the `@timmbr` ecosystem, the platform enforces dedicated port allocations.

---

## 1. Platform Port Allocation Matrix

| Application             | Workspace Directory    | Port      | Role                                                              |
| :---------------------- | :--------------------- | :-------- | :---------------------------------------------------------------- |
| **`timmbr-core`**       | `../timmbr-core`       | **3000**  | Fastify / NestJS REST API and primary commerce backend engine.    |
| **`timmbr-console`**    | `.`                    | **5000**  | Administrative web application and commerce management plane.     |
| **`timmbr-ds`**         | `../timmbr-ds`         | **6006**  | Design System Storybook component development environment.        |
| **`timmbr-storefront`** | `../timmbr-storefront` | **8000**  | Storefront ingress host, control plane, and domain reverse proxy. |
| _Storefront Zones_      | `zones/*`              | **8001+** | Decoupled secondary storefront zone micro-applications.           |

---

## 2. Console Port Configuration

Timmbr Console is pinned to Port **5000**:

1. **`package.json`**:

   ```json
   {
     "scripts": {
       "dev": "next dev -p 5000",
       "start": "next start -p 5000"
     }
   }
   ```

2. **`.env.example`**:
   ```env
   PORT=5000
   ```
