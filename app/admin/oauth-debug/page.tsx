export default function OAuthDebugPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">OAuth Debug Information</h1>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Redirect URL Configuration</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">NEXT_PUBLIC_SITE_URL:</span>{" "}
              <code className="bg-muted px-2 py-1 rounded">{siteUrl || "NOT SET"}</code>
            </div>
            <div>
              <span className="font-medium">Supabase URL:</span>{" "}
              <code className="bg-muted px-2 py-1 rounded">{supabaseUrl || "NOT SET"}</code>
            </div>
            <div>
              <span className="font-medium">OAuth will redirect to:</span>{" "}
              <code className="bg-muted px-2 py-1 rounded">{siteUrl || window.location.origin}</code>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-yellow-50">
          <h2 className="font-semibold mb-2 text-yellow-900">Important: Supabase Site URL Configuration</h2>
          <div className="text-sm text-yellow-800 space-y-2">
            <p>If OAuth is redirecting to localhost, you need to configure the Site URL in Supabase:</p>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Go to Supabase Dashboard</li>
              <li>
                Navigate to <strong>Authentication</strong> → <strong>URL Configuration</strong>
              </li>
              <li>
                Set <strong>Site URL</strong> to:{" "}
                <code className="bg-yellow-100 px-2 py-1 rounded">{siteUrl || "your-production-url"}</code>
              </li>
              <li>
                Add to <strong>Redirect URLs</strong>:{" "}
                <code className="bg-yellow-100 px-2 py-1 rounded">{siteUrl || "your-production-url"}/*</code>
              </li>
              <li>
                Click <strong>Save</strong>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
