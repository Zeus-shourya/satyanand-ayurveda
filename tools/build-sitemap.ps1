# Regenerates sitemap.xml from assets/js/catalog.js. Run after adding or removing products:
#   powershell -ExecutionPolicy Bypass -File tools\build-sitemap.ps1
param([string]$Site = (Split-Path $PSScriptRoot -Parent))
$ErrorActionPreference = 'Stop'
$base = 'https://zeus-shourya.github.io/satyanand-ayurveda/'
$lastmod = (Get-Date -Format 'yyyy-MM-dd')
$cat = [IO.File]::ReadAllText((Join-Path $Site 'assets\js\catalog.js'), [Text.Encoding]::UTF8)

$catIds = [regex]::Matches($cat, "(?m)^\s*\{ id: '([a-z0-9-]+)',\s+name:") | ForEach-Object { $_.Groups[1].Value }
$prodIds = [regex]::Matches($cat, "(?m)^\s{6}id: '([a-z0-9-]+)', name:") | ForEach-Object { $_.Groups[1].Value }
$prodCats = [regex]::Matches($cat, "(?m)^\s{6}category: '([a-z0-9-]+)'") | ForEach-Object { $_.Groups[1].Value }

# only categories that actually have products
$catIds = $catIds | Where-Object { $prodCats -contains $_ }

$urls = New-Object System.Collections.Generic.List[string]
$urls.Add($base)
$urls.Add($base + 'shop.html')
foreach ($c in $catIds) { $urls.Add($base + 'shop.html?cat=' + $c) }
foreach ($p in @('dosha-quiz.html', 'consult.html', 'about.html', 'policies.html')) { $urls.Add($base + $p) }
foreach ($id in $prodIds) { $urls.Add($base + 'product.html?id=' + $id) }

$sb = New-Object System.Text.StringBuilder
[void]$sb.Append("<?xml version=`"1.0`" encoding=`"UTF-8`"?>`n")
[void]$sb.Append("<urlset xmlns=`"http://www.sitemaps.org/schemas/sitemap/0.9`">`n")
foreach ($u in $urls) {
  $loc = [Security.SecurityElement]::Escape($u)
  [void]$sb.Append("  <url><loc>$loc</loc><lastmod>$lastmod</lastmod></url>`n")
}
[void]$sb.Append("</urlset>`n")
[IO.File]::WriteAllText((Join-Path $Site 'sitemap.xml'), $sb.ToString(), (New-Object Text.UTF8Encoding($false)))
"categories: $($catIds.Count)  products: $($prodIds.Count)  total urls: $($urls.Count)"
