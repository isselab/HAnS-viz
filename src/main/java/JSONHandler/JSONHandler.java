package JSONHandler;

import com.intellij.openapi.project.Project;
import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import org.cef.callback.CefQueryCallback;
import org.jetbrains.annotations.TestOnly;
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

    private static FeatureService featureService;

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
        featureService = project.getService(FeatureService.class);
        featureService.getFeatureFileMappingAndTanglingMap(this);
    }

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
        obj.put("name", feature.getFeatureName());
        var tangledFeatureMap = tanglingMap.get(feature);
        int tanglingDegree = tangledFeatureMap != null ? tangledFeatureMap.size() : 0;

        List<FeatureModelFeature> childFeatureList = featureService.getChildFeatures(feature);

        //recursively get all child features
        JSONArray childArr = new JSONArray();
        for(var child : childFeatureList){
            childArr.add(featureToJSON(child, fileMapping, tanglingMap));
        }
        obj.put("children", childArr);
        obj.put("tanglingDegree", tanglingDegree);
        obj.put("lines", fileMapping.get(feature.getLPQText()).getTotalFeatureLineCount());
        obj.put("totalLines", getTotalLineCountWithChilds(feature, fileMapping));

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
            locationObj.put("path", path);
            locations.add(locationObj);
        }
        obj.put("locations", locations);
        return obj;
    }

    private static JSONArray getChildFeaturesAsJson(FeatureModelFeature parentFeature, HashMap<String, FeatureFileMapping> fileMapping) {
        JSONArray children = new JSONArray();
        var childFeatureList = featureService.getChildFeatures(parentFeature);

        //iterate over each child and recursively get its childs
        for(var child : childFeatureList){
            //get linecount of feature via mapping

            JSONObject childJson = new JSONObject();
            childJson.put("name", child.getLPQText());
            childJson.put("value", getTotalLineCountWithChilds(child,fileMapping));
            childJson.put("children", getChildFeaturesAsJson(child, fileMapping));
            children.add(childJson);
        }
        return children;
    }


    private static int getTotalLineCountWithChilds(FeatureModelFeature parent, HashMap<String, FeatureFileMapping> fileMapping){
        int total = 0;
        for(var child : featureService.getChildFeatures(parent)){
            total += getTotalLineCountWithChilds(child, fileMapping);
        }
        if(fileMapping.containsKey(parent.getLPQText()))
            total += fileMapping.get(parent.getLPQText()).getTotalFeatureLineCount();
        return total;
    }
}
