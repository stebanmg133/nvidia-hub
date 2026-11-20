package com.nvidia.hub;

import java.net.URI;
import java.time.Instant;
import java.util.*;
import javax.xml.parsers.DocumentBuilderFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.w3c.dom.*;
import org.xml.sax.InputSource;
import java.io.StringReader;

@RestController
@RequestMapping("/api")
public class ApiController {
  private final RestClient http = RestClient.builder().defaultHeader("User-Agent", "NvidiaHub/1.0 (contact: hello@example.com)").build();

  @GetMapping("/news")
  public Map<String,Object> news() {
    List<Map<String,String>> items = new ArrayList<>();
    List<String> feeds = List.of("https://nvidianews.nvidia.com/releases.xml", "https://blogs.nvidia.com/feed/");
    for (String feed : feeds) try {
      String xml = http.get().uri(URI.create(feed)).retrieve().body(String.class);
      if (xml == null) continue;
      var factory = DocumentBuilderFactory.newInstance();
      factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
      factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
      var builder = factory.newDocumentBuilder();
      var doc = builder.parse(new InputSource(new StringReader(xml)));
      NodeList entries = doc.getElementsByTagName("item");
      if (entries.getLength() == 0) entries = doc.getElementsByTagName("entry");
      for (int i=0; i<entries.getLength() && items.size()<18; i++) {
        Element e=(Element)entries.item(i);
        String title=tag(e,"title"), link=tag(e,"link"), date=tag(e,"pubDate");
        if (link.isBlank()) { NodeList links=e.getElementsByTagName("link"); if(links.getLength()>0) link=((Element)links.item(0)).getAttribute("href"); }
        if (!title.isBlank() && link.startsWith("https://")) items.add(Map.of("title",clean(title),"url",link,"date",date.isBlank()?"Actualidad":date,"source",feed.contains("blogs")?"NVIDIA Blog":"NVIDIA Newsroom"));
      }
    } catch(Exception ignored) { }
    return Map.of("items",items,"updatedAt",Instant.now().toString(),"source","NVIDIA Newsroom + NVIDIA Blog");
  }

  @GetMapping("/quote")
  public Map<String,Object> quote() {
    try {
      String json=http.get().uri("https://query1.finance.yahoo.com/v8/finance/chart/NVDA?range=1d&interval=5m").retrieve().body(String.class);
      var root=new com.fasterxml.jackson.databind.ObjectMapper().readTree(json).path("chart").path("result").get(0);
      var meta=root.path("meta");
      double price=meta.path("regularMarketPrice").asDouble();
      double prev=meta.path("chartPreviousClose").asDouble(meta.path("previousClose").asDouble());
      return Map.of("symbol","NVDA","price",price,"change",price-prev,"changePercent",prev==0?0:(price-prev)/prev*100,"currency",meta.path("currency").asText("USD"),"marketState",meta.path("marketState").asText("UNKNOWN"),"updatedAt",Instant.now().toString(),"source","Yahoo Finance");
    } catch(Exception ex) { return Map.of("symbol","NVDA","error","Cotización temporalmente no disponible","source","Yahoo Finance","updatedAt",Instant.now().toString()); }
  }

  private String tag(Element e,String name) { NodeList n=e.getElementsByTagName(name); return n.getLength()==0?"":n.item(0).getTextContent().trim(); }
  private String clean(String s) { return s.replaceAll("<[^>]*>","").replace("&amp;","&").replace("&#8217;","’").replace("&quot;","\""); }
}
