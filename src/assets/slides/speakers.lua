local colors = {
  G = "#ef4444",
  A = "#34d399",
}
local palette = { "#60a5fa", "#f59e0b", "#a78bfa", "#f472b6", "#22d3ee" }

local function color_for(letter)
  return colors[letter] or palette[letter:byte() % #palette + 1]
end

function Str(el)
  local letter, rest = el.text:match("^%[%[(%u)%]%](.*)$")
  if letter then
    local span = pandoc.Span(
      pandoc.Str(letter .. ":"),
      { style = "color:" .. color_for(letter) .. ";font-weight:bold" }
    )
    if rest ~= "" then
      return { span, pandoc.Str(rest) }
    end
    return span
  end
end
