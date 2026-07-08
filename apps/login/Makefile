# Local development against the Revolve UAT Zitadel Cloud instance.
#
# Prerequisites (see PoC-Plan-217-LoginV2.md in eos-platform):
#   - PAT of the `custom-login-ui-client` service user saved at ../../login-client.pat
#   - deps installed: pnpm install --filter @zitadel/login...
#   - workspace packages built once:
#       pnpm --filter @zitadel/proto run generate
#       pnpm --filter @zitadel/client run build
#
# CUSTOM_REQUEST_HEADERS: Zitadel Cloud resolves the instance from
# x-zitadel-instance-host (locally it would fall back to Host: 127.0.0.1 -> 404)
# and validates x-zitadel-public-host against trusted domains, so we set the
# former and remove the latter (empty value = remove).

ZITADEL_INSTANCE := revolve-labs-uat-t3wtma.zitadel.cloud

# Image coordinates — override from CI: make docker-build TAG=$GITHUB_SHA
IMAGE ?= us-central1-docker.pkg.dev/eos-platform-develop/saas/login-ui
TAG ?= dev

.PHONY: dev
dev:
	ZITADEL_API_URL=https://$(ZITADEL_INSTANCE) \
	ZITADEL_SERVICE_USER_TOKEN_FILE=../../login-client.pat \
	CUSTOM_REQUEST_HEADERS="x-zitadel-instance-host:$(ZITADEL_INSTANCE),x-zitadel-public-host:" \
	pnpm dev

# Same as dev, but with the in-memory API cache disabled so real ConnectErrors
# surface instead of "fetch() returned undefined".
.PHONY: dev-debug
dev-debug:
	ZITADEL_API_URL=https://$(ZITADEL_INSTANCE) \
	ZITADEL_SERVICE_USER_TOKEN_FILE=../../login-client.pat \
	CUSTOM_REQUEST_HEADERS="x-zitadel-instance-host:$(ZITADEL_INSTANCE),x-zitadel-public-host:" \
	API_CACHE_ENABLED=false \
	pnpm dev

# Production standalone build on port 3001. Use this to actually exercise the
# login form: in `pnpm dev` (Turbopack) React never hydrates on this route, so
# inputs don't register and Continue stays disabled. The production build
# hydrates fine. Rebuild with `make build` after code changes.
# Install deps and build the workspace packages the login app depends on
# (@zitadel/proto is generated, @zitadel/client is compiled). Idempotent.
.PHONY: prepare
prepare:
	cd ../.. && pnpm install --filter @zitadel/login...
	cd ../.. && pnpm --filter @zitadel/proto run generate
	cd ../.. && pnpm --filter @zitadel/client run build

.PHONY: build
build:
	pnpm run build

# Full chain for CI and local image builds: workspace prep -> Next.js
# standalone build -> docker build. The Dockerfile only COPYs .next/standalone,
# so the pnpm build MUST run before docker build.
.PHONY: docker-build
docker-build: prepare build
	docker build -t $(IMAGE):$(TAG) .

.PHONY: docker-push
docker-push:
	docker push $(IMAGE):$(TAG)

.PHONY: prod
prod:
	cd .next/standalone && \
	ZITADEL_API_URL=https://$(ZITADEL_INSTANCE) \
	ZITADEL_SERVICE_USER_TOKEN_FILE=$(abspath ../../login-client.pat) \
	CUSTOM_REQUEST_HEADERS="x-zitadel-instance-host:$(ZITADEL_INSTANCE),x-zitadel-public-host:" \
	HOSTNAME=127.0.0.1 PORT=3001 \
	./entrypoint.sh node apps/login/server.js
