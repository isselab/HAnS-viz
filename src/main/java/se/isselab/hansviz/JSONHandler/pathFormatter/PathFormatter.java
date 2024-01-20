package se.isselab.hansviz.JSONHandler.pathFormatter;

import com.intellij.openapi.project.Project;

public class PathFormatter {
    public static String shortenPathToSource(Project project, String path){
        if(project.getBasePath()==null) return path;
        String newPath = path.replaceFirst(project.getBasePath(),"");
        return newPath;
    }
    public static String shortenPathToFileInFolder(String path){
        // TODO "\\"
        String divider;
        if(path.contains("/")) divider ="/";
        else if (path.contains("\"")) divider = "\"";
        else return path;

        String [] tokens = path.split(divider);
        if(tokens.length==1) return tokens[0];
        String newPath = divider + tokens[tokens.length-2] + divider + tokens[tokens.length-1];
        return newPath;
    }
    public static String shortenPathToFile(String path){
        String divider;
        if(path.contains("/")) divider ="/";
        else if (path.contains("\"")) divider = "\"";
        else return path;

        String [] tokens = path.split("/");
        String file = tokens[tokens.length - 1];
        return file;
    }
}
