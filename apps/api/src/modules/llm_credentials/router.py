from uuid import UUID

from fastapi import APIRouter

from src.core.dependencies import CurrentUser, LlmCredentialControllerDeps

from .schema import LlmCredentialCreate, LlmCredentialRead, LlmCredentialUpdate

router = APIRouter(prefix="/llm-credentials", tags=["LLM Credentials"])


@router.get("/", response_model=list[LlmCredentialRead])
def get_llm_credentials(
    user: CurrentUser,
    controller: LlmCredentialControllerDeps,
):
    return controller.get_llm_credentials()


@router.get("/{credential_id}", response_model=LlmCredentialRead)
def get_llm_credential(
    user: CurrentUser,
    controller: LlmCredentialControllerDeps,
    credential_id: UUID,
):
    return controller.get_llm_credential(credential_id)


@router.post("/", response_model=LlmCredentialRead)
def add_llm_credential(
    user: CurrentUser,
    controller: LlmCredentialControllerDeps,
    body: LlmCredentialCreate,
):
    return controller.add_llm_credential(body)


@router.patch("/{credential_id}", response_model=LlmCredentialRead)
def update_llm_credential(
    user: CurrentUser,
    controller: LlmCredentialControllerDeps,
    credential_id: UUID,
    body: LlmCredentialUpdate,
):
    return controller.update_llm_credential(credential_id, body)


@router.delete("/{credential_id}", response_model=LlmCredentialRead)
def remove_llm_credential(
    user: CurrentUser,
    controller: LlmCredentialControllerDeps,
    credential_id: UUID,
):
    return controller.remove_llm_credential(credential_id)
