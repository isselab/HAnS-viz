package JSONHandler;

import com.intellij.openapi.project.Project;
import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import org.cef.callback.CefQueryCallback;
import se.isselab.HAnS.HAnSCallback;
import se.isselab.HAnS.Logger;
import se.isselab.HAnS.featureExtension.FeatureService;
import se.isselab.HAnS.featureLocation.FeatureFileMapping;
import se.isselab.HAnS.featureLocation.FeatureLocationManager;
import se.isselab.HAnS.featureModel.psi.FeatureModelFeature;
import se.isselab.HAnS.metrics.FeatureMetrics;
import se.isselab.HAnS.metrics.FeatureTangling;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;



public class JSONHandler implements HAnSCallback {
    private CefQueryCallback callback;
    private JSONType jsonType;
    private Project project;
    @Override
    public void onComplete(FeatureMetrics featureMetrics) {
        JSONObject dataJSON = new JSONObject();
        JSONArray nodesJSON = new JSONArray();
        JSONArray linksJSON = new JSONArray();
        HashMap<String, FeatureFileMapping> fileMapping = featureMetrics.getFileMapping();
        HashMap<FeatureModelFeature, HashSet<FeatureModelFeature>> tanglingMap = featureMetrics.getTanglingMap();

        HashMap<FeatureModelFeature, Integer> featureToId = new HashMap<>();
        int counter = 0;
        List<FeatureModelFeature> topLevelFeatures = null;

        FeatureService featureService = project.getService(FeatureService.class);
        if(jsonType == JSONType.Default || jsonType == JSONType.Tree || jsonType == JSONType.TreeMap)
            topLevelFeatures = featureService.getRootFeatures();

        else if(jsonType == JSONType.Tangling)
            topLevelFeatures = featureService.getFeatures();

        else {
            Logger.print(Logger.Channel.ERROR, "Could not create JSON because of invalid type");
            //return new JSONObject();
        }


        for(var feature : topLevelFeatures) {
            JSONObject featureObj = featureToJSON(feature, fileMapping, tanglingMap);
            nodesJSON.add(featureObj);
            featureToId.put(feature, counter);
            counter++;
        }


        for(var featureToTangledFeatures : tanglingMap.entrySet()){
            for(var tangledFeature : featureToTangledFeatures.getValue()){
                //add link if id of feature is less than the id of the tangled one
                if(!featureToId.containsKey(featureToTangledFeatures.getKey()))
                    continue;
                if(featureToId.get(featureToTangledFeatures.getKey()) < featureToId.get(tangledFeature))
                {
                    JSONObject obj = new JSONObject();
                    obj.put("source", featureToTangledFeatures.getKey().getLPQText());
                    obj.put("target", tangledFeature.getLPQText());
                    linksJSON.add(obj);
                }
            }
        }
        dataJSON.put("features", nodesJSON);
        dataJSON.put("tanglingLinks", linksJSON);
        System.out.println("Ich bin von dem BackgroundTask");
        System.out.println(dataJSON.toJSONString());
        callback.success(dataJSON.toJSONString());
    }

    public enum JSONType {Default, Tree, TreeMap, Tangling}

    public JSONHandler(Project project, JSONType type, CefQueryCallback callback) {
        this.project = project;
        this.jsonType = type;
        this.callback = callback;
        FeatureService featureService = project.getService(FeatureService.class);
        featureService.getFeatureFileMappingAndTanglingMap(this);
    }
    /*public void getFeatureJSON(Project project, JSONType type, CefQueryCallback callback){
        this.callback = callback;
        //converts TanglingMap to JSON
        FeatureService featureService =
        //featureService.getFeatureFileMappingAndTanglingMap(this);

        JSONObject dataJSON = new JSONObject();
        JSONArray nodesJSON = new JSONArray();
        JSONArray linksJSON = new JSONArray();

        HashMap<String, FeatureFileMapping> fileMapping = featureService.getAllFeatureFileMappings();
        HashMap<FeatureModelFeature, HashSet<FeatureModelFeature>> tanglingMap = featureService.getTanglingMap();

        //get links
        //map feature with id
        *//*HashMap<FeatureModelFeature, Integer> featureToId = new HashMap<>();
        int counter = 0;
        List<FeatureModelFeature> topLevelFeatures;


        if(type == JSONType.Default || type == JSONType.Tree || type == JSONType.TreeMap)
            topLevelFeatures = featureService.getRootFeatures();

        else if(type == JSONType.Tangling)
            topLevelFeatures = featureService.getFeatures();

        else {
            Logger.print(Logger.Channel.ERROR, "Could not create JSON because of invalid type");
            return new JSONObject();
        }


        for(var feature : topLevelFeatures) {
            JSONObject featureObj = featureToJSON(feature, fileMapping, tanglingMap);
            nodesJSON.add(featureObj);
            featureToId.put(feature, counter);
            counter++;
        }


        for(var featureToTangledFeatures : tanglingMap.entrySet()){
            for(var tangledFeature : featureToTangledFeatures.getValue()){
                //add link if id of feature is less than the id of the tangled one
                if(!featureToId.containsKey(featureToTangledFeatures.getKey()))
                    continue;
                if(featureToId.get(featureToTangledFeatures.getKey()) < featureToId.get(tangledFeature))
                {
                    JSONObject obj = new JSONObject();
                    obj.put("source", featureToTangledFeatures.getKey().getLPQText());
                    obj.put("target", tangledFeature.getLPQText());
                    linksJSON.add(obj);
                }
            }
        }
        dataJSON.put("features", nodesJSON);
        dataJSON.put("tanglingLinks", linksJSON);


        return dataJSON;*//*
    }*/

    /*private JSONObject proceedFeatureJSONwithFeatureFileMappings(HashMap<String, FeatureFileMapping> fileMapping) {

    }*/
    /**
     * Helperfunction to recursively create JSONObjects of features
     * Recursion takes place within the child property of the feature
     * @param feature feature which should be converted to JSON
     * @return JSONObject of given feature
     */
    private static JSONObject featureToJSON(FeatureModelFeature feature, HashMap<String, FeatureFileMapping> fileMapping, HashMap<FeatureModelFeature, HashSet<FeatureModelFeature>> tanglingMap){
        //TODO THESIS
        // put into hans viz
        JSONObject obj = new JSONObject();
        obj.put("id", feature.getLPQText());
        obj.put("name", feature.getLPQText());
        var tangledFeatureMap = tanglingMap.get(feature);
        int tanglingDegree = tangledFeatureMap != null ? tangledFeatureMap.size() : 0;

        FeatureService featureService = new FeatureService();
        List<FeatureModelFeature> childFeatureList = featureService.getChildFeatures(feature);

        //recursively get all child features
        JSONArray childArr = new JSONArray();
        for(var child : childFeatureList){
            childArr.add(featureToJSON(child, fileMapping, tanglingMap));
        }
        obj.put("children", childArr);
        obj.put("tanglingDegree", tanglingDegree);
        obj.put("lines", fileMapping.get(feature.getLPQText()).getTotalFeatureLineCount());
        obj.put("totalLines", featureService.getTotalLineCountWithChilds(feature));

        //put locations and their line count into array
        JSONArray locations = new JSONArray();
        var fileMappings = fileMapping.get(feature.getLPQText()).getAllFeatureLocations();
        for(String path : fileMappings.keySet()){
            JSONArray blocks = new JSONArray();
            for(var block : fileMappings.get(path).second){
                JSONObject blockObj = new JSONObject();
                blockObj.put("start", block.getStartLine());
                blockObj.put("end", block.getEndLine());
                blocks.add(blockObj);
            }
            //get the linecount of a feature for each file and add it
            JSONObject locationObj = new JSONObject();

            locationObj.put("lines", fileMapping.containsKey(path) ? fileMapping.get(path).getFeatureLineCountInFile(path) : 0);

            locationObj.put("blocks", blocks);
            locationObj.put(path, blocks);
            locations.add(locationObj);
        }
        obj.put("locations", locations);
        return obj;
    }
}
