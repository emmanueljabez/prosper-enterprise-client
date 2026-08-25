export const releaseCompanyWalkthroughInteractionLock = (
  documentRef: Pick<Document, 'body'> | null | undefined = typeof document === 'undefined' ? null : document,
) => {
  if (!documentRef?.body) {
    return
  }

  documentRef.body.style.pointerEvents = ''
}
