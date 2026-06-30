require 'time'

dir  = File.dirname(__FILE__)
txt  = File.read(File.join(dir, 'gbook', 'POST.TXT'), encoding: 'utf-8')
outp = File.join(dir, 'gbook', 'rss.xml')

url  = 'https://jan.mikata.ru'

txt  = txt.gsub(/=begin.*?=end/m, '')
txt  = txt.gsub(/^;.*$/, '')

parts = txt.split('<>')
out   = []

i = 0
while i + 3 < parts.length
    t = parts[i].strip
    d = parts[i + 1].strip
    h = parts[i + 2].strip
    c = parts[i + 3].strip
    i += 4

    next if t.empty?
    out << { t: t, d: d, h: h, c: c }
end

fixv = Time.parse("2026-01-01 00:00:00 +0000")

out.each do |p|
    d = p[:d].gsub('-xx', '-01')
    h = p[:h].gsub('xx:xx', '00:00').gsub('xx', '00')
    
    prs_h = nil
    begin
        prs_h = Time.parse("#{d} #{h}")
        if prs_h <= fixv
            prs_h = fixv + 60
        end
    rescue
        prs_h = fixv + 60
    end
    
    fixv = prs_h
    p[:pub_date] = prs_h.rfc2822
end

out.reverse!

rssx = <<~HEADER
  <?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
  <channel>
  <title>RYUUIISOU SCANLATIONS - Blog</title>
  <link>#{url}/gbook/</link>
  <description>Blog posts from RYUUIISOU SCANLATIONS</description>
HEADER

out.each do |p|
    c = p[:c].gsub("\n", "<br>")
             .gsub(']]>', ']]&gt;')
             .gsub(/width:\s*(\d+)%/) { |m| "width:#{$1.to_i / 2}%" }

    rssx << "  <item>\n"
    rssx << "    <title>#{p[:t].encode(xml: :text)}</title>\n"
    rssx << "    <link>#{url}/gbook/</link>\n"
    rssx << "    <description><![CDATA[#{c}]]></description>\n"
    rssx << "    <pubDate>#{p[:pub_date]}</pubDate>\n"
    rssx << "  </item>\n"
end

rssx << "  </channel>\n</rss>\n"

File.write(outp, rssx, encoding: 'utf-8')
puts "wrote #{out.length} posts -> #{outp}"
