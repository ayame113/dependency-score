# dependency-score

> **Warning**<br> Under construction

this library:
[![score](https://dependency-score.deno.dev/badge.svg?url=https://raw.githubusercontent.com/ayame113/dependency-score/main/serve.ts)](https://dependency-score.deno.dev/api/dependencies_score?url=https://raw.githubusercontent.com/ayame113/dependency-score/main/serve.ts)

oak:
[![score](https://dependency-score.deno.dev/badge.svg?url=https://deno.land/x/oak@v10.6.0/mod.ts)](https://dependency-score.deno.dev/api/dependencies_score?url=https://deno.land/x/oak@v10.6.0/mod.ts)

fresh:
[![score](https://dependency-score.deno.dev/badge.svg?url=https://deno.land/x/fresh@1.0.1/server.ts)](https://dependency-score.deno.dev/api/dependencies_score?url=https://deno.land/x/fresh@1.0.1/server.ts)

This module is using:

- https://deno.land/x/deno_graph@0.28.0
- https://deno.land/x/udd@0.7.3
- https://deno.land/x/semver@v1.4.0
- https://shields.io/category/other#your-badge

```mermaid
graph TD;
    A(input: module specifier)-->B[deno_graph<br><br>get dependency]-->C[deno-udd<br><br>get update]-->D[deno-semver<br><br>conpare version]-->E[shields.io<br><br>create badge]-->F(output: dependency score);
```
