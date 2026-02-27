param([int]$DelaySeconds = 8)

$links = @(
  'https://jules.google.com/session/16466217733870806908',
  'https://jules.google.com/session/10477724696304193176',
  'https://jules.google.com/session/8668260785888565184',
  'https://jules.google.com/session/11935652350680617480',
  'https://jules.google.com/session/18254622915026223915',
  'https://jules.google.com/session/1087166558902660933',
  'https://jules.google.com/session/40752895452215736',
  'https://jules.google.com/session/4525598279913339410',
  'https://jules.google.com/session/9180080533109525426',
  'https://jules.google.com/session/18129429152731416058',
  'https://jules.google.com/session/11416470582973239618',
  'https://jules.google.com/session/12081396901406586791',
  'https://jules.google.com/session/6273306650365163728',
  'https://jules.google.com/session/9560335776048584827',
  'https://jules.google.com/session/3450701748010819332',
  'https://jules.google.com/session/13876452222973047068',
  'https://jules.google.com/session/4329740214836968792',
  'https://jules.google.com/session/3320578085767859478',
  'https://jules.google.com/session/4905860891436679169',
  'https://jules.google.com/session/10402850537500348923',
  'https://jules.google.com/session/7273588174438580003',
  'https://jules.google.com/session/13132490543996065109',
  'https://jules.google.com/session/16561818405099308603'
)

foreach ($url in $links) {
  Start-Process $url
  Start-Sleep -Seconds $DelaySeconds
}
