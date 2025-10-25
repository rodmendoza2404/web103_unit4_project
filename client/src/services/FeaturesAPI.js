export async function getFeatures(includeOptions=true) {
  const res = await fetch(`/api/features${includeOptions ? '?include=options' : ''}`)
  return await res.json()
}
